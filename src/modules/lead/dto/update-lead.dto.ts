import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  @Matches(/^\+998[0-9]{9}$/, {
    message: 'Phone number must start with +998 and contain exactly 13 digits.',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  statusId: number;

  @ApiProperty()
  @IsOptional()
  courseId?: number;
}
