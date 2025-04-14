import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
