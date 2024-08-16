import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reaction } from './reaction.entity';
import { Repository } from 'typeorm';
import { E_ReactionParentType } from 'src/enum';
import { UserService } from 'src/user/user.service';
import { CommentService } from 'src/comment/comment.service';
import { TestUnitService } from 'src/test-unit/test-unit.service';
import { CreateReactionDto } from './reaction.dto';
import { SseService } from 'src/sse/sse.service';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly testUnitService: TestUnitService,
    private readonly sseService: SseService,
  ) { }




  async createOrUpdateReaction(reaction: CreateReactionDto, authorId: string): Promise<Reaction> {
    const targetAuthor = await this.userService.findOneById(authorId);
    if (!targetAuthor) throw new NotFoundException('User not found');
    const newTargetReaction = new Reaction({
      reactionType: reaction.reactionType,
      parentType: reaction.parentType,
    });
    newTargetReaction.user = targetAuthor;

    if (reaction.parentType === E_ReactionParentType.testUnit) {
      const testUnit = await this.testUnitService.getTestUnitById(reaction.parentTestUnitId);
      if (!testUnit) throw new NotFoundException('TestUnit not found');

      newTargetReaction.parentTestUnit = testUnit;
    } else {
      const comment = await this.commentService.getCommentById(reaction.parentCommentId);
      if (!comment) throw new NotFoundException('Comment not found');

      newTargetReaction.parentComment = comment;
    }

    const existingReaction = await this.reactionRepository.findOne({
      where: {
        user: {
          id: targetAuthor.id
        },
        ...(newTargetReaction.parentType === E_ReactionParentType.testUnit
          ? {
            parentTestUnit: {
              testUnitId: newTargetReaction.parentTestUnit.testUnitId
            }
          }
          : {
            parentComment: {
              commentId: newTargetReaction.parentComment.commentId
            }
          }
        )
      }
    })

    if (!existingReaction) {
      return await this.reactionRepository.save(newTargetReaction);
    }

    if (existingReaction.reactionType === newTargetReaction.reactionType) {
      return await this.reactionRepository.remove(existingReaction);
    }


    await this.reactionRepository.update(existingReaction.id, newTargetReaction);

    this.sseService.emitCommentPostedEvent(existingReaction.id);

    return newTargetReaction

  }

}
