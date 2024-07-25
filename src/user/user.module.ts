import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { MailService } from 'src/mail/mail.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';


@Module({
  imports: [TypeOrmModule.forFeature([User]),],
  controllers: [UserController],
  providers: [UserService, UserRepository, MailService, JwtService],
  exports: [UserService],
})
export class UsersModule { }
