import { E_Role } from "src/enum";

export class SignInDto {
  email: string;
  pw: string;
}

export class LoggedInDto {
  access_token: string;
  email: string;
  id: string;
  username: string;
  role: E_Role
  isPwDefault?: boolean;
}
