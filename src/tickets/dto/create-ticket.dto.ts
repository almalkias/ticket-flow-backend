import { IsString, IsNotEmpty, IsEmail, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Trim } from '../../common/decorators/trim.decorator';

export class CreateTicketDto {
  @ApiProperty()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.fullNameRequired') })
  customer_name!: string;

  @ApiProperty()
  @Trim()
  @IsEmail({}, { message: i18nValidationMessage('validation.validEmailRequired') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.emailRequired') })
  customer_email!: string;

  @ApiProperty()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.subjectRequired') })
  subject!: string;

  @ApiProperty()
  @Trim()
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
