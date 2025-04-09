import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshUserDto {
  @ApiProperty()
  @IsNotEmpty()
  refreshToken: string;
}
