import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsBooleanString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UserStatus } from '../entities/user.entity';
import { Type } from 'class-transformer';

export class GetUserQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  full_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  phone_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  isDeleted?: string | boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  region?: string;
}
