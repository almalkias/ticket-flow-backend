import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Ticket } from '../tickets/ticket.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Ticket])],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
