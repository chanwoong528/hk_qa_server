import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './auth.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { E_UserStatus } from 'src/enum';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,

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


  @Post("verify-email")
  async verifyFirstLogin(@Request() req, @Body() reqBody: { token: string }) {
    console.log(reqBody.token)
    const payload = await this.jwtService.verifyAsync(reqBody.token);
    if (!!payload.id) {
      const updatedResult = await this.userService.updateUserById(payload.id, { userStatus: E_UserStatus.ok })

      if (updatedResult.affected > 0) {
        return { code: 200, message: "success" }
      }
    }
    throw new InternalServerErrorException('Internal Server Error');
  }
}
