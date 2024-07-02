import { E_Role } from 'src/enum';

export class CreateUserDto {
  username: string;
  email: string;
  role: E_Role;
  pw: string;
}

export class UpdateUserDto {
  role?: E_Role;
  pw?: string;
}
