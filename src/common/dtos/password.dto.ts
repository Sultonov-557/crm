import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export function IsPassword(required = true) {
  return required
    ? applyDecorators(
        ApiProperty(),
        IsNotEmpty(),
        IsString(),
        IsStrongPassword({
          minLength: 4,
          minLowercase: 0,
          minNumbers: 0,
          minUppercase: 0,
          minSymbols: 0,
        }),
      )
    : applyDecorators(
        ApiPropertyOptional(),
        IsOptional(),
        IsNotEmpty(),
        IsString(),
        IsStrongPassword({
          minLength: 4,
          minLowercase: 0,
          minNumbers: 0,
          minUppercase: 0,
          minSymbols: 0,
        }),
      );
}
