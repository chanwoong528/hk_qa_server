import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwVersionService } from 'src/sw-version/sw-version.service';
import { UserRepository } from 'src/user/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { SwVersionModule } from 'src/sw-version/sw-version.module';
import { UserService } from 'src/user/user.service';
import { UsersModule } from 'src/user/user.module';
import { UploadsService } from 'src/uploads/uploads.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    UsersModule,
    SwVersionModule
  ],
  controllers: [CommentController],
  providers: [CommentService, UserRepository, UploadsService],
  exports: [CommentService],
})
export class CommentModule { }
