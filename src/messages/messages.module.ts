import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Ticket } from '../tickets/ticket.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Ticket]), NotificationsModule],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
