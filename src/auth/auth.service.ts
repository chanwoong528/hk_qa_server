import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from 'src/user/user.service';
import { LoggedInDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) { }

  async signIn(email: string, pwInput: string): Promise<LoggedInDto> {
    const existUser = await this.usersService.findOneByEmail(email);
    if (!existUser) {
      throw new NotFoundException('User does not exist!');
    }

    const isPwDefault = await bcrypt.compare("123456", existUser?.pw);
    const isPwMatch = await bcrypt.compare(pwInput, existUser?.pw);
    if (!isPwMatch) {
      throw new UnauthorizedException();
    }

    const { id, username, role } = existUser;
    const payload = { sub: id, username, role, email };
    const accToken = await this.jwtService.signAsync(payload);

    return {
      id, username, role, email,
      isPwDefault: isPwDefault,
      access_token: accToken,
    };
  }
}
