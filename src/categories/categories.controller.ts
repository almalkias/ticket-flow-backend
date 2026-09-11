import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { RolesGuard } from '../firebase/roles.guard';
import { Roles } from '../firebase/roles.decorator';
import { User, UserRole } from '../users/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../firebase/current-user.decorator';
import { Query } from '@nestjs/common';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateCategoryDto, @CurrentUser() currentUser: User) {
    return this.categoriesService.create(dto, currentUser);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  findAll(@CurrentUser() currentUser: User) {
    return this.categoriesService.findAll(currentUser);
  }

  @Get('public')
  findActive(@Query('org') orgUuid: string) {
    return this.categoriesService.findActive(orgUuid);
  }

  @Patch(':id/deactivate')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id') id: number, @CurrentUser() currentUser: User) {
    return this.categoriesService.deactivate(id, currentUser);
  }
}
