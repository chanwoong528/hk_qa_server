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
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UpdateResult } from 'typeorm';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { E_Role } from 'src/enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @UseGuards(AuthGuard)
  getUsers(@Query('getType') getType): Promise<User[]> {
    console.log(getType);
    if (getType === 'all') {
      return this.userService.findAll(getType);
    }
    return this.userService.findAll();
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
    //TODO: have to send verification Email
    return await this.userService.create(user);
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
