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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async signIn(@Body() userLoginInfo: SignInDto) {
    return this.authService.signIn(userLoginInfo.email, userLoginInfo.pw);
  }

  @UseGuards(AuthGuard)
  @Get('jwt-test')
  async jwtTest(@Request() req) {
    return req.user;
  }
}
