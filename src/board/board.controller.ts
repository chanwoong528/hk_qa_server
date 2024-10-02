import {
  Controller,
  Get,
  Param,
  UseGuards,
  Post,
  Request,
  Body,
  Query,
  Patch,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CreateBoardDto, UpdateBoardDto } from './board.dto';
import { Board } from './board.entity';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @UseGuards(AuthGuard)
  @Get(':swTypeId')
  async getBoards(
    @Param('swTypeId') swTypeId: string,
    @Query('boardType') boardType: string,
    @Query('page') page: number = 1,
  ): Promise<{
    boardList: Board[];
    page: number;
    total: number;
    lastPage: number;
  }> {
    return await this.boardService.getBoards(swTypeId, boardType, Number(page));
  }

  @UseGuards(AuthGuard)
  @Get('detail/:boardId')
  async getBoardDetail(@Param('boardId') boardId: string): Promise<Board> {
    return await this.boardService.getBoardDetail(boardId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createBoard(
    @Body() createBoardParam: CreateBoardDto,
    @Request() req,
  ): Promise<Board> {
    const { sub } = req.user;
    createBoardParam.userId = sub;

    return await this.boardService.createBoard(createBoardParam);
  }

  @UseGuards(AuthGuard)
  @Patch(':boardId')
  async updateBoard(
    @Param('boardId') boardId: string,
    @Body() updateBoardParam: UpdateBoardDto,
    @Request() req,
  ): Promise<Board> {
    const { sub } = req.user;

    if (updateBoardParam.userId !== sub) {
      throw new Error('Invalid user');
    }

    return await this.boardService.updateBoard(boardId, updateBoardParam);
  }
}
