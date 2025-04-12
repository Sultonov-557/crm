import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
