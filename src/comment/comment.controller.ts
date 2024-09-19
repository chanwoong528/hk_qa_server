import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './comment.dto';
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createComment(@Body() commentInfo: CreateCommentDto): Promise<Comment> {
    return await this.commentService.createComment(commentInfo);
  }

  @Get('board/:boardId')
  @UseGuards(AuthGuard)
  async getCommentsByBoardId(
    @Param('boardId', new ParseUUIDPipe()) boardId: string,
    @Query('page') page: number = 1,
  ): Promise<{
    commentList: Comment[];
    page: number;
    total: number;
    lastPage: number;
  }> {
    const commentList = await this.commentService.getCommentsByBoardId(
      boardId,
      Number(page),
    );
    return commentList;
  }

  @Get(':swVersionId')
  @UseGuards(AuthGuard)
  async getCommentsBySwVersionId(
    @Param('swVersionId', new ParseUUIDPipe()) swVersionId: string,
    @Query('page') page: number = 1,
  ): Promise<{
    commentList: Comment[];
    page: number;
    total: number;
    lastPage: number;
  }> {
    const commentList = await this.commentService.getCommentsBySwVersionId(
      swVersionId,
      Number(page),
    );
    return commentList;
  }

  @Get('child-comment/:parentId')
  @UseGuards(AuthGuard)
  async getCommentsByParent(
    @Param('parentId', new ParseUUIDPipe()) parentId: string,
  ): Promise<Comment[]> {
    return await this.commentService.getChildCommentsByParentId(parentId);
  }
}
