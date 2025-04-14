import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsId } from 'src/common/dtos/id.dto';

export class CreateGroupDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @IsId(true)
  telegramId: string;
}
