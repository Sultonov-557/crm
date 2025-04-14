import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourseStatus } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  end_date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiProperty({ example: CourseStatus.INACTIVE })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
