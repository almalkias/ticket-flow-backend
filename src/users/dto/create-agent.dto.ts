import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  full_name!: string;

  @ApiProperty()
  @IsEmail({}, { message: 'A valid email is required' })
  email!: string;
}
