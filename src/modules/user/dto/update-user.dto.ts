import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  full_name?: string;

  @ApiProperty({ example: '+998901234567' })
  @Matches(/^\+998[0-9]{9}$/, {
    message: 'Phone number must start with +998 and contain exactly 13 digits.',
  })
  @IsNotEmpty()
  phone_number?: string;

  @IsOptional()
  @IsString()
  job?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  employers?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;
}
