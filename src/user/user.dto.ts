
export class CreateUserDto {
  username: string;
  email: string;
  role: string;
  pw: string;
}

export class UpdateUserDto {
  role: string;
  pw: string;
}

