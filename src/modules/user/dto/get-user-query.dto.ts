import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UserStatus } from '../entities/user.entity';

export class GetUserQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  full_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
