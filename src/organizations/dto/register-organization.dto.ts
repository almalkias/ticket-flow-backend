import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Trim } from '../../common/decorators/trim.decorator';

export class RegisterOrganizationDto {
  @ApiProperty()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.orgNameRequired') })
  org_name!: string;

  @ApiProperty()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.fullNameRequired') })
  admin_full_name!: string;

  @ApiProperty()
  @Trim()
  @IsEmail({}, { message: i18nValidationMessage('validation.validEmailRequired') })
  admin_email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: i18nValidationMessage('validation.passwordMinLength') })
  admin_password!: string;
}
