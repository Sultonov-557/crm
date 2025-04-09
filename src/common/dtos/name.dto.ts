import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export function IsName(required = true) {
  return required
    ? applyDecorators(ApiProperty(), IsNotEmpty(), IsString())
    : applyDecorators(
        ApiPropertyOptional(),
        IsOptional(),
        IsNotEmpty(),
        IsString(),
      );
}
