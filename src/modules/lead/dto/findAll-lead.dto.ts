import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class findAllLeadQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  fullName?: string;

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

  @IsOptional()
  @ApiPropertyOptional({
    type: Number,
    required: false,
    description: 'Number ID',
    example: 1,
  })
  courseId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  phoneNumber?: string;
}
