import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  @Matches(/^\+998[0-9]{9}$/, {
    message: 'Phone number must start with +998 and contain exactly 13 digits.',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telegramUserId?: string;

  @ApiProperty()
  courseId: number;

  @ApiProperty()
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
