import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.messageBodyRequired') })
  body!: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_internal?: boolean;

  @ApiPropertyOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.validEmailRequired') })
  @IsOptional()
  customer_email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reference_number?: string;
}
