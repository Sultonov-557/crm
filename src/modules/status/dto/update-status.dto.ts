import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStatusDto } from './create-status.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
