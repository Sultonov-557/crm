import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class findAllLeadQueryDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @IsInt({ each: true })
  @ApiPropertyOptional({
    type: Number,
    isArray: true,
    required: false,
    description: 'Array of number IDs',
    example: [1, 2, 3],
  })
  statusId?: number[];
}
