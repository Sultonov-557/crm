import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
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
  @ApiProperty({ example: CourseStatus.INACTIVE })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiProperty({ type: [Number] })
  @IsOptional()
  userIds?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  broadcastList?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  broadcastMessage?: string;
}
