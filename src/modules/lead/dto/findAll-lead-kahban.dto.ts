import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class findAllLeadKahbanQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  phoneNumber: string;

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

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    default: 'createdAt',
  })
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  @ApiPropertyOptional({
    description: 'Sort order (ASC or DESC)',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  order?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Get leads organized for Kanban view',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  forKanban?: boolean;

  @ApiPropertyOptional({
    description:
      'Specific status ID to load more leads for (used with statusPage)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  loadMoreStatusId?: number;

  @ApiPropertyOptional({
    description: 'Page number for a specific status column in Kanban view',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  statusPage?: number;

  @ApiPropertyOptional({
    description: 'Number of leads per status column in Kanban view',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  statusLimit?: number;
}
