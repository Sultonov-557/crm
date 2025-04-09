import { IsName } from 'src/common/dtos/name.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class GetAdminQueryDto extends PaginationDto {
  @IsName(false)
  username?: string;
}
