import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './comment.dto';
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService
  ) { }

  @Post()
  @UseGuards(AuthGuard)
  async createComment(@Body() commentInfo: CreateCommentDto): Promise<Comment> {
    return await this.commentService.createComment(commentInfo);
  }

  @Get(":swVersionId")
  @UseGuards(AuthGuard)
  async getCommentsBySwVersionId(
    @Param('swVersionId', new ParseUUIDPipe()) swVersionId: string,
  ): Promise<Comment[]> {
    const commentList = await this.commentService.getCommentsBySwVersionId(swVersionId);
    console.log(commentList[0].parentComment)
    return commentList
  }

  @Get("child-comment/:parentId")
  @UseGuards(AuthGuard)
  async getCommentsByParent(
    @Param('parentId', new ParseUUIDPipe()) parentId: string,
  ): Promise<Comment[]> {
    return await this.commentService.getChildCommentsByParentId(parentId);
  }





}
