import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from 'src/user/user.service';
import { LoggedInDto } from './auth.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  async verifyJwtToken(token: string): Promise<User> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
  extractTokenFromHeader(headerAuth: string): string | undefined {
    const [type, token] = headerAuth.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
