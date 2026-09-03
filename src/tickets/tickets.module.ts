import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Category, User])],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
