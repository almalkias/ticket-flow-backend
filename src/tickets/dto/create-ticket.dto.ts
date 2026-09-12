import { IsString, IsNotEmpty, IsEmail, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  customer_name!: string;

  @ApiProperty()
  @IsEmail({}, { message: 'A valid email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  customer_email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Subject is required' })
  subject!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'Invalid category' })
  category_id?: number;

  @ApiProperty()
  @IsUUID('all', { message: 'Invalid organization link' })
  org_uuid!: string;
}
