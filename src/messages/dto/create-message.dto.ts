import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_internal?: boolean;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reference_number?: string;
}
