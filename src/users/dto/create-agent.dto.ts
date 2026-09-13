import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.fullNameRequired') })
  full_name!: string;

  @ApiProperty()
  @IsEmail({}, { message: i18nValidationMessage('validation.validEmailRequired') })
  email!: string;
}
