import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class findAllStatusQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;
  
  @ApiPropertyOptional({ 
    description: 'Get all statuses for Kanban view without pagination',
    default: false,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  forKanban?: boolean;
}
