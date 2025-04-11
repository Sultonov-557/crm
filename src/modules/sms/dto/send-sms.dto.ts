import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendSMSDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  numbers?: string[];

  @ApiProperty()
  @IsNotEmpty()
  message: string;
}
