import { IsName } from 'src/common/dtos/name.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class GetUserQueryDto extends PaginationDto {
  @IsName(false)
  username?: string;

  @IsName(false)
  firstName?: string;

  @IsName(false)
  lastName?: string;
}
