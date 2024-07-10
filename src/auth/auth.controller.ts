import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './auth.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Post()
  async signIn(@Body() userLoginInfo: SignInDto) {
    return this.authService.signIn(userLoginInfo.email, userLoginInfo.pw);
  }

  @UseGuards(AuthGuard)
  @Get('')// login check
  async jwtTest(@Request() req) {
    const result = await this.userService.findOneById(req.user.sub);

    return result;
  }
}
