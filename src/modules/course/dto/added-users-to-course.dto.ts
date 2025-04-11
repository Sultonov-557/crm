import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class AddUsersToCourseDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @ArrayNotEmpty()
  userIds: number[];
}
