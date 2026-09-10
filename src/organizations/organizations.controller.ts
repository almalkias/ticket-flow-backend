import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { RegisterOrganizationDto } from './dto/register-organization.dto';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post('register')
  register(@Body() dto: RegisterOrganizationDto) {
    return this.organizationsService.register(dto);
  }
}
