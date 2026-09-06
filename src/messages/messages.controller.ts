import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../firebase/current-user.decorator';
import { User } from '../users/user.entity';
import { OptionalFirebaseAuthGuard } from '../firebase/optional-firebase-auth.guard';

@ApiTags('Messages')
@Controller('tickets/:ticketId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @ApiBearerAuth()
  @UseGuards(OptionalFirebaseAuthGuard)
  @Post()
  create(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: User | undefined,
  ) {
    return this.messagesService.create(ticketId, dto, user);
  }

  @ApiBearerAuth()
  @UseGuards(OptionalFirebaseAuthGuard)
  @Get()
  findAll(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @CurrentUser() user: User | undefined,
  ) {
    return this.messagesService.findAll(ticketId, user);
  }
}
