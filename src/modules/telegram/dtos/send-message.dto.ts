import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { IsId } from 'src/common/dtos/id.dto';

export class SendMessageDto {
  @IsId(true)
  courseId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  telegramIds?: string[];
}
