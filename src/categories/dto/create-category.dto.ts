import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Trim } from '../../common/decorators/trim.decorator';

export class CreateCategoryDto {
  @ApiProperty()
  @Trim()
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.categoryNameRequired'),
  })
  name!: string;
}
