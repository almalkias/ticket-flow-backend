import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, SenderType } from './message.entity';
import { Ticket, TicketStatus } from '../tickets/ticket.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    ticketId: number,
    dto: CreateMessageDto,
    user?: User,
  ): Promise<Message> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
      relations: { assigned_to: true },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.status === TicketStatus.CLOSED) {
      throw new ForbiddenException('Cannot reply to a closed ticket');
    }

    let senderName: string;
    let senderType: SenderType;
    let senderUserId: number | undefined = undefined;
    let isInternal = false;

    if (user) {
      // agent or admin
      senderName = user.full_name;
      senderType = SenderType.AGENT;
      senderUserId = user.id;
      isInternal = dto.is_internal ?? false;
    } else {
      // customer
      if (!dto.customer_email || !dto.reference_number) {
        throw new BadRequestException(
          'customer_email and reference_number are required',
        );
      }

      if (
        dto.customer_email !== ticket.customer_email ||
        dto.reference_number !== ticket.reference_number
      ) {
        throw new ForbiddenException('Invalid email or reference number');
      }

      senderName = ticket.customer_name;
      senderType = SenderType.CUSTOMER;

      if (ticket.status === TicketStatus.RESOLVED) {
        ticket.status = TicketStatus.IN_PROGRESS;
        await this.ticketsRepository.save(ticket);
      }

      const admins = await this.usersRepository.find({
        where: { role: UserRole.ADMIN, is_active: true },
      });
      const recipientIds = admins.map((a) => a.id);
      if (ticket.assigned_to) {
        recipientIds.push(ticket.assigned_to.id);
      }

      await this.notificationsService.createForUsers(
        recipientIds,
        ticketId,
        NotificationType.NEW_REPLY,
        `Customer replied on ticket: ${ticket.reference_number}`,
      );
    }

    const message = this.messagesRepository.create({
      ticket: { id: ticketId },
      body: dto.body,
      is_internal: isInternal,
      sender_type: senderType,
      sender_user_id: senderUserId,
      sender_name: senderName,
    });

    return this.messagesRepository.save(message);
  }

  async findAll(ticketId: number, user?: User): Promise<Message[]> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (!user) {
      // customer — only public messages
      return this.messagesRepository.find({
        where: { ticket: { id: ticketId }, is_internal: false },
        order: { created_at: 'ASC' },
      });
    }

    // agent or admin — all messages
    return this.messagesRepository.find({
      where: { ticket: { id: ticketId } },
      order: { created_at: 'ASC' },
    });
  }
}
