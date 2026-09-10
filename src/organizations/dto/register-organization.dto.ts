import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOrganizationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  org_name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  admin_full_name!: string;

  @ApiProperty()
  @IsEmail()
  admin_email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  admin_password!: string;
}
