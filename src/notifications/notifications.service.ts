import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async createForUsers(
    userIds: number[],
    ticketId: number,
    type: NotificationType,
    message: string,
  ): Promise<void> {
    const notifications = userIds.map((userId) =>
      this.notificationsRepository.create({
        user: { id: userId },
        ticket: { id: ticketId },
        type,
        message,
      }),
    );

    await this.notificationsRepository.save(notifications);
  }

  async findAll(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { id, user: { id: userId } },
      { is_read: true },
    );
  }
}
