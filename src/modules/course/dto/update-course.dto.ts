import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourseStatus } from '../entities/course.entity';

export class UpdateCourseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  end_date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiPropertyOptional({ example: CourseStatus.INACTIVE })
  @IsOptional()
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
