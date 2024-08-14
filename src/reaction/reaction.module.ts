import { Module } from '@nestjs/common';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { Reaction } from './reaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestUnitService } from 'src/test-unit/test-unit.service';
import { CommentService } from 'src/comment/comment.service';
import { UserService } from 'src/user/user.service';
import { CommentModule } from 'src/comment/comment.module';
import { TestUnitModule } from 'src/test-unit/test-unit.module';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reaction]),
    CommentModule,
    TestUnitModule
  ],
  controllers: [ReactionController],
  providers: [ReactionService, UserRepository, UserService,],
})
export class ReactionModule { }
