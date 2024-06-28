import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  getUsers(): string {
    return "user"
  }
  getUser(id: string): string {
    return "user"
  }
  createUser(user: any): string {
    return "user"
  }
}
