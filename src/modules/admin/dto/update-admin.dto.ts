import { IsName } from 'src/common/dtos/name.dto';
import { IsPassword } from 'src/common/dtos/password.dto';

export class UpdateAdminDto {
  @IsName(false)
  username: string;

  @IsPassword(false)
  password: string;

  @IsPassword(false)
  oldPassword: string;
}
