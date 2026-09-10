import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { RolesGuard } from '../firebase/roles.guard';
import { Roles } from '../firebase/roles.decorator';
import { UserRole, User } from './user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../firebase/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('agents')
  @Roles(UserRole.ADMIN)
  createAgent(@Body() dto: CreateAgentDto, @CurrentUser() currentUser: User) {
    return this.usersService.createAgent(dto, currentUser);
  }

  @Patch('agents/:id/deactivate')
  @Roles(UserRole.ADMIN)
  deactivateAgent(@Param('id') id: number, @CurrentUser() currentUser: User) {
    return this.usersService.deactivateAgent(id, currentUser);
  }

  @Get('agents')
  @Roles(UserRole.ADMIN)
  findAllAgents(@CurrentUser() currentUser: User) {
    return this.usersService.findAllAgents(currentUser);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  me(@CurrentUser() user: User) {
    return user;
  }
}
