import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsId } from 'src/common/dtos/id.dto';

export class SendSMSDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  numbers?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @IsId(true)
  courseId: number;
}
