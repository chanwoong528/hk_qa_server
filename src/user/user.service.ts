import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { UpdateResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';
import { E_UserStatus } from 'src/enum';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) { }

  async findAll(type?: string): Promise<User[]> {
    if (type === 'all') {
      return this.userRepository.find();
    }
    return this.userRepository.find({ where: { userStatus: E_UserStatus.ok } });
  }

  async findOneById(id: string): Promise<User> {
    const foundUser = await this.userRepository.findOneByUUID(id);
    return foundUser;
  }

  async findOneByEmail(email: string): Promise<User> {
    const foundUserByEmail = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'role', 'pw'],
    });

    return foundUserByEmail;
  }

  async create(user: CreateUserDto): Promise<User> {

    const hashedPw = await bcrypt.hash(
      "123456",
      Number(this.configService.get('BCRYPT_SALT')),
    );
    const createdUser = await this.userRepository.createUser({
      ...user,
      pw: hashedPw,
    });

    delete createdUser.pw;

    return createdUser;
  }

  async updateUserById(id: string, user: UpdateUserDto): Promise<UpdateResult> {
    let updatedUser = user;
    if (!!user.pw) {
      const hashedPw = await bcrypt.hash(
        user.pw,
        Number(this.configService.get('BCRYPT_SALT')),
      );
      updatedUser = {
        ...updatedUser,
        pw: hashedPw,
      }
    }

    return this.userRepository.update(id, updatedUser);
  }
}
