import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { Organization } from '../organizations/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Category, User, Organization]),
    NotificationsModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
