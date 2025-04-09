import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class GetUserQueryDto extends PaginationDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  full_name?: string;
}
