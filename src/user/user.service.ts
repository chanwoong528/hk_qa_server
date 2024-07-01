import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { UpdateResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService
  ) { }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOneById(id: string): Promise<User> {
    const foundUser = await this.userRepository.findOneByUUID(id)
    return foundUser;
  }

  async findOneByEmail(email: string): Promise<User> {
    const foundUserByEmail = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'role', 'pw']
    })

    return foundUserByEmail;
  }


  async create(user: CreateUserDto): Promise<void> {
    const hashedPw = await bcrypt.hash(user.pw, Number(this.configService.get("BCRYPT_SALT")));
    return this.userRepository.createUser({ ...user, pw: hashedPw })
  }

  async updateUserById(id: string, user: UpdateUserDto): Promise<UpdateResult> {
    const hashedPw = await bcrypt.hash(user.pw, Number(this.configService.get("BCRYPT_SALT")));
    return this.userRepository.update(id, {
      ...user,
      ...(user.pw && { pw: hashedPw })
    })
  }
}
