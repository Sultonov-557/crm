import { IsName } from 'src/common/dtos/name.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class GetGroupQueryDto extends PaginationDto {
  @IsName(false)
  name?: string;
}
