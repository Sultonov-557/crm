import { IsName } from 'src/common/dtos/name.dto';
import { IsPassword } from 'src/common/dtos/password.dto';

export class RegisterUserDto {
  @IsName()
  username: string;

  @IsPassword()
  password: string;

  @IsName()
  firstName: string;

  @IsName(false)
  lastName: string;
}
