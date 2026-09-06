import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { RolesGuard } from '../firebase/roles.guard';
import { Roles } from '../firebase/roles.decorator';
import { CurrentUser } from '../firebase/current-user.decorator';
import { User, UserRole } from '../users/user.entity';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.AGENT)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.notificationsService.findAll(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(id, user.id);
  }
}
