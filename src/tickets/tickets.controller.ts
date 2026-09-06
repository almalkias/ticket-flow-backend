import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { RolesGuard } from '../firebase/roles.guard';
import { Roles } from '../firebase/roles.decorator';
import { CurrentUser } from '../firebase/current-user.decorator';
import { UserRole, User } from '../users/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  findAll(@CurrentUser() user: User) {
    return this.ticketsService.findAll(user);
  }

  @Get('track')
  track(@Query('email') email: string, @Query('reference') reference: string) {
    return this.ticketsService.track(email, reference);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  findOne(@Param('id') id: number, @CurrentUser() user: User) {
    return this.ticketsService.findOne(id, user);
  }

  @Patch(':id/assign')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  assign(@Param('id') id: number, @Body() dto: AssignTicketDto) {
    return this.ticketsService.assign(id, dto);
  }

  @Patch(':id/priority')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updatePriority(@Param('id') id: number, @Body() dto: UpdatePriorityDto) {
    return this.ticketsService.updatePriority(id, dto);
  }

  @Patch(':id/category')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateCategory(@Param('id') id: number, @Body() dto: UpdateCategoryDto) {
    return this.ticketsService.updateCategory(id, dto);
  }

  @Patch(':id/resolve')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  resolve(@Param('id') id: number, @CurrentUser() user: User) {
    return this.ticketsService.resolve(id, user);
  }

  @Patch(':id/close')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  close(@Param('id') id: number) {
    return this.ticketsService.close(id);
  }
}
