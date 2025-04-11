import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { LeadStatus } from '../entities/lead.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class findAllLeadQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  status?: LeadStatus;
}
