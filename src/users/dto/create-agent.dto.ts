import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Trim } from '../../common/decorators/trim.decorator';

export class CreateAgentDto {
  @ApiProperty()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.fullNameRequired') })
  full_name!: string;

  @ApiProperty()
  @Trim()
  @IsEmail({}, { message: i18nValidationMessage('validation.validEmailRequired') })
  email!: string;
}
