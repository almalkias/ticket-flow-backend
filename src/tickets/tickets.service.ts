import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './ticket.entity';
import { Category } from '../categories/category.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const category = await this.categoriesRepository.findOne({
      where: { id: dto.category_id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.ticketsRepository.count();
    const reference_number = `TKT-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const ticket = this.ticketsRepository.create({
      ...dto,
      reference_number,
      category,
    });

    return this.ticketsRepository.save(ticket);
  }

  async findAll(user: User): Promise<Ticket[]> {
    if (user.role === UserRole.ADMIN) {
      return this.ticketsRepository.find({
        relations: { category: true, assigned_to: true },
        order: { created_at: 'DESC' },
      });
    }

    return this.ticketsRepository.find({
      where: { assigned_to: { id: user.id } },
      relations: { category: true, assigned_to: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, user: User): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: { category: true, assigned_to: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (user.role === UserRole.AGENT && ticket.assigned_to?.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return ticket;
  }

  async assign(id: number, dto: AssignTicketDto): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const agent = await this.usersRepository.findOne({
      where: { id: dto.agent_id, role: UserRole.AGENT, is_active: true },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    ticket.assigned_to = agent;
    ticket.status = TicketStatus.IN_PROGRESS;
    return this.ticketsRepository.save(ticket);
  }

  async updatePriority(id: number, dto: UpdatePriorityDto): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    ticket.priority = dto.priority;
    return this.ticketsRepository.save(ticket);
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const category = await this.categoriesRepository.findOne({
      where: { id: dto.category_id },
    });
    if (!category) throw new NotFoundException('Category not found');

    ticket.category = category;
    return this.ticketsRepository.save(ticket);
  }

  async resolve(id: number, user: User): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: { assigned_to: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.assigned_to?.id !== user.id) {
      throw new ForbiddenException(
        'You can only resolve your assigned tickets',
      );
    }

    ticket.status = TicketStatus.RESOLVED;
    ticket.resolved_at = new Date();
    return this.ticketsRepository.save(ticket);
  }

  async close(id: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    ticket.status = TicketStatus.CLOSED;
    ticket.closed_at = new Date();
    return this.ticketsRepository.save(ticket);
  }
}
