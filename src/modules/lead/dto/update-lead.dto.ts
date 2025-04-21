import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateLeadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional({example:"+998999999999"})
  @IsOptional()
  @Matches(/^\+998[0-9]{9}$/, {
    message: 'Phone number must start with +998 and contain exactly 13 digits.',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  statusId: number;

  @ApiPropertyOptional()
  @IsOptional()
  courseId?: number;
}
