import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { CreateCommentDto } from './comment.dto';
import { Comment } from './comment.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { SwVersionService } from 'src/sw-version/sw-version.service';

@Injectable()
export class CommentService {

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly userService: UserService,
    private readonly swVersionService: SwVersionService
  ) { }


  async createComment(commentInfo: CreateCommentDto): Promise<Comment> {

    const author = await this.userService.findOneById(commentInfo.userId)

    if (!author) {
      throw new NotFoundException('User not found');
    }
    const swVersion = await this.swVersionService.getSwVersionById(commentInfo.swVersionId)
    if (!swVersion) {
      throw new NotFoundException('SwVersion not found');
    }
    let newComment = new Comment(commentInfo);


    if (commentInfo.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { commentId: commentInfo.parentId }
      })

      if (!parentComment) {
        throw new NotFoundException('Parent Comment not found');
      }
      newComment.parentComment = parentComment
    }

    newComment.user = author;
    newComment.swVersion = swVersion;


    return await this.commentRepository.save(newComment);
  }

  async getCommentsBySwVersionId(swVersionId: string): Promise<Comment[]> {

    return await this.commentRepository.find({
      relations: ['user', 'swVersion', 'childComments', 'childComments.user', "parentComment"],
      where: {
        swVersion: {
          swVersionId: swVersionId
        },
        parentComment: IsNull()
      }
    })
  }

  async getChildCommentsByParentId(parentId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: {
        parentComment: {
          commentId: parentId
        }
      }
    })
  }
}
