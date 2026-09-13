import { IsString, IsNotEmpty, IsEmail, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.fullNameRequired') })
  customer_name!: string;

  @ApiProperty()
  @IsEmail({}, { message: i18nValidationMessage('validation.validEmailRequired') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.emailRequired') })
  customer_email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.subjectRequired') })
  subject!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.descriptionRequired') })
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'Invalid category' })
  category_id?: number;

  @ApiProperty()
  @IsUUID('all', { message: 'Invalid organization link' })
  org_uuid!: string;
}
