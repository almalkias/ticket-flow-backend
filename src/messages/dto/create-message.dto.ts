import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Trim } from '../../common/decorators/trim.decorator';

export class CreateMessageDto {
  @ApiProperty()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.messageBodyRequired') })
  body!: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_internal?: boolean;

  @ApiPropertyOptional()
  @Trim()
  @IsEmail({}, { message: i18nValidationMessage('validation.validEmailRequired') })
  @IsOptional()
  customer_email?: string;

  @ApiPropertyOptional()
  @Trim()
  @IsString()
  @IsOptional()
  reference_number?: string;
}
