import { IsString, IsNotEmpty, IsEmail, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  @IsNumber()
  category_id!: number;

  @ApiProperty()
  @IsUUID()
  org_uuid!: string;
}
