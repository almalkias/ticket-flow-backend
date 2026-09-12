import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOrganizationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required' })
  org_name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  admin_full_name!: string;

  @ApiProperty()
  @IsEmail({}, { message: 'A valid email is required' })
  admin_email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  admin_password!: string;
}
