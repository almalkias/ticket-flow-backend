import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;
}
