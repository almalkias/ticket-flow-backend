import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase/firebase-auth.guard';
import { CurrentUser } from './firebase/current-user.decorator';

@Controller()
export class AppController {
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  getMe(@CurrentUser() user: any) {
    return user;
  }
}
