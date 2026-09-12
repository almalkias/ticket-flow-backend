import { IsString, IsNotEmpty, IsEmail, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customer_name!: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  customer_email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @ApiProperty()
  @IsUUID()
  org_uuid!: string;
}
