import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class GetUserQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  full_name?: string;
}
