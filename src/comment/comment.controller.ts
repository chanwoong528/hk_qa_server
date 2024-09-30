import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
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

  @Delete(':commentId')
  @UseGuards(AuthGuard)
  async deleteComment(
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
  ): Promise<any> {
    // Promise<Comment> {
    //TODO:
    // Check if the user is the owner of the comment
    // delete the comment
    // return await this.commentService.deleteComment(commentId);
  }

  @Patch(':commentId')
  @UseGuards(AuthGuard)
  async updateComment(
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @Request() req,
    @Body() commentInfo: UpdateCommentDto,
  ): Promise<any> {
    //  Promise<Comment> {
    //TODO:
    const { sub } = req.user;
    const targetComment = await this.commentService.getCommentById(commentId);

    if (sub !== targetComment.user.id)
      throw new Error('You are not the owner of the comment');

    const updatedResult =
      await this.commentService.patchCommentContent(commentInfo);

    return updatedResult;

    // Check if the user is the owner of the comment
    // commentId  & comment Content can be changed
    // return await this.commentService.updateComment(commentId, commentInfo);
  }
}
