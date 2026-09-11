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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly orgsRepository: Repository<Organization>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const org = await this.orgsRepository.findOne({
      where: { uuid: dto.org_uuid },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: dto.category_id, organization: { id: org.id } },
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
      organization: { id: org.id },
    });

    const saved = await this.ticketsRepository.save(ticket);

    const admins = await this.usersRepository.find({
      where: {
        role: UserRole.ADMIN,
        is_active: true,
        organization: { id: org.id },
      },
    });
    const adminIds = admins.map((a) => a.id);

    await this.notificationsService.createForUsers(
      adminIds,
      saved.id,
      NotificationType.NEW_TICKET,
      `New ticket submitted: ${saved.reference_number}`,
    );

    return saved;
  }

  async findAll(user: User): Promise<Ticket[]> {
    if (user.role === UserRole.ADMIN) {
      return this.ticketsRepository.find({
        where: { organization: { id: user.organization.id } },
        relations: { category: true, assigned_to: true },
        order: { created_at: 'DESC' },
      });
    }

    return this.ticketsRepository.find({
      where: {
        assigned_to: { id: user.id },
        organization: { id: user.organization.id },
      },
      relations: { category: true, assigned_to: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, user: User): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, organization: { id: user.organization.id } },
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

  async assign(
    id: number,
    dto: AssignTicketDto,
    currentUser: User,
  ): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, organization: { id: currentUser.organization.id } },
      relations: { category: true },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const agent = await this.usersRepository.findOne({
      where: {
        id: dto.agent_id,
        role: UserRole.AGENT,
        is_active: true,
        organization: { id: currentUser.organization.id },
      },
    });
    if (!agent) throw new NotFoundException('Agent not found');

    ticket.assigned_to = agent;
    ticket.status = TicketStatus.IN_PROGRESS;
    const saved = await this.ticketsRepository.save(ticket);

    await this.notificationsService.createForUsers(
      [agent.id],
      saved.id,
      NotificationType.TICKET_ASSIGNED,
      `You have been assigned ticket: ${saved.reference_number}`,
    );

    return saved;
  }

  async updatePriority(
    id: number,
    dto: UpdatePriorityDto,
    currentUser: User,
  ): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, organization: { id: currentUser.organization.id } },
      relations: { category: true, assigned_to: true },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    ticket.priority = dto.priority;
    return this.ticketsRepository.save(ticket);
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
    currentUser: User,
  ): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, organization: { id: currentUser.organization.id } },
      relations: { category: true, assigned_to: true },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const category = await this.categoriesRepository.findOne({
      where: {
        id: dto.category_id,
        organization: { id: currentUser.organization.id },
      },
    });

    if (!category) throw new NotFoundException('Category not found');

    ticket.category = category;
    return this.ticketsRepository.save(ticket);
  }

  async resolve(id: number, user: User): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, organization: { id: user.organization.id } },
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
    const saved = await this.ticketsRepository.save(ticket);

    const admins = await this.usersRepository.find({
      where: { role: UserRole.ADMIN, is_active: true, organization: { id: user.organization.id } },
    });
    const adminIds = admins.map((a) => a.id);

    await this.notificationsService.createForUsers(
      adminIds,
      saved.id,
      NotificationType.STATUS_CHANGED,
      `Ticket resolved: ${saved.reference_number}`,
    );

    return saved;
  }

  async close(id: number, currentUser: User): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, organization: { id: currentUser.organization.id } },
      relations: { category: true, assigned_to: true },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    ticket.status = TicketStatus.CLOSED;
    ticket.closed_at = new Date();
    return this.ticketsRepository.save(ticket);
  }

  async track(
    email: string,
    reference: string,
    orgUuid: string,
  ): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: {
        customer_email: email,
        reference_number: reference,
        organization: { uuid: orgUuid },
      },
      relations: { category: true, assigned_to: true },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return ticket;
  }
}
