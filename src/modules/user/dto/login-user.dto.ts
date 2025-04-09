import { IsName } from 'src/common/dtos/name.dto';
import { IsPassword } from 'src/common/dtos/password.dto';

export class LoginUserDto {
  @IsName()
  username: string;

  @IsPassword()
  password: string;
}
