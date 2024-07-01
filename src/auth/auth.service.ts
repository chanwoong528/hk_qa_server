import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(private usersService: UserService, private jwtService: JwtService) { }

  async signIn(email: string, pwInput: string): Promise<any> {
    const existUser = await this.usersService.findOneByEmail(email)
    const isPwMatch = await bcrypt.compare(pwInput, existUser?.pw)

    if (!isPwMatch) {
      throw new UnauthorizedException();
    }
    const { id, username, role } = existUser;
    const payload = { sub: id, username, role, email };
    const accToken = await this.jwtService.signAsync(payload)
    return {
      access_token: accToken
    };
  }
}
