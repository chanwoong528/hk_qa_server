import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

import { AuthGuard } from 'src/common/guard/auth.guard';
import { Roles } from 'src/common/decorator/roles.decorator';

import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';

import { E_Role, E_SendToQue, E_SendType } from 'src/enum';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,

    @InjectQueue('queue')
    private readonly mQue: Queue,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  getUsers(@Query('getType') getType): Promise<User[]> {
    if (getType === 'all') {
      return this.userService.findAll(getType);
    }
    return this.userService.findAll();
  }
  @Post('forgot-password')
  async forgotPassword(@Body() body) {
    const user = await this.userService.findOneByEmail(body.email);

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    await this.mQue.add(E_SendToQue.email, {
      sendType: E_SendType.forgotPassword,
      user: user,
    })
    return { message: 'Email sent!' };

  }




  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User does not exist!');
    } else {
      return user;
    }
  }

  @Post()
  @Roles(E_Role.master)
  @UseGuards(AuthGuard)
  async createUser(@Body() user: CreateUserDto): Promise<User> {

    const createdUser = await this.userService.create(user);

    await this.mQue.add(E_SendToQue.email, {
      sendType: E_SendType.verification,
      user: createdUser,
      token: createdUser.verificationToken,
    })

    return createdUser;
  }

  @Patch(':id')
  async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() user: UpdateUserDto,
  ): Promise<UpdateResult> {
    const updatedResult = await this.userService.updateUserById(id, user);
    if (updatedResult.affected === 0) {
      throw new NotFoundException('User does not exist!');
    }
    return updatedResult;
  }
}
