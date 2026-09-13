import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.categoryNameRequired'),
  })
  name!: string;
}
