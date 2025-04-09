import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsName } from 'src/common/dtos/name.dto';
import { IsPassword } from 'src/common/dtos/password.dto';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  full_name?: string;
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  phone_number?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  job?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  position?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  employers?: number;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  location?: string;
}
