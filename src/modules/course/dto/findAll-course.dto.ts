import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CourseStatus } from '../entities/course.entity';

export class findAllCourseQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
