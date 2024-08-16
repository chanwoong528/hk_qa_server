import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { SwVersionModule } from 'src/sw-version/sw-version.module';
import { UsersModule } from 'src/user/user.module';
import { UploadsService } from 'src/uploads/uploads.service';
import { SseService } from 'src/sse/sse.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    UsersModule,
    SwVersionModule
  ],
  controllers: [CommentController],
  providers: [CommentService, UserRepository, UploadsService, SseService],
  exports: [CommentService],
})
export class CommentModule { }
