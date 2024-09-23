import { map } from 'rxjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './board.entity';
import { CreateBaordDto } from './board.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { UserRepository } from 'src/user/user.repository';
import { SwTypeService } from 'src/sw-type/sw-type.service';
import * as jsdom from 'jsdom';
import { UploadsService } from 'src/uploads/uploads.service';
import { SwMaintainerService } from 'src/sw-maintainer/sw-maintainer.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { E_SendToQue, E_SendType } from 'src/enum';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    private readonly userRepository: UserRepository,
    private readonly swTypeService: SwTypeService,
    private readonly uploadsService: UploadsService,
    private readonly swMaintainerService: SwMaintainerService,
    @InjectQueue('queue')
    private readonly mQue: Queue,
  ) {}

  async getBoards(
    swTypeId: string,
    boardType: string = 'req',
  ): Promise<Board[]> {
    const targetBoards = await this.boardRepository.find({
      relations: ['user'],
      where: {
        boardType: boardType,
        swType: {
          swTypeId: swTypeId,
        },
      },
    });
    if (!targetBoards) throw new NotFoundException('Boards not found');

    return targetBoards;
  }
  async getBoardDetail(boardId: string): Promise<Board> {
    const targetBoard = await this.boardRepository.findOne({
      relations: ['user'],
      where: { boardId: boardId },
    });
    if (!targetBoard) throw new NotFoundException('Board not found');

    return targetBoard;
  }

  async createBoard(boardParam: CreateBaordDto): Promise<Board> {
    try {
      const newBoard = new Board(boardParam);
      const author = await this.userRepository.findOneByUUID(boardParam.userId);
      if (!author) throw new NotFoundException('User not found');
      newBoard.user = author;

      const targetSwType = await this.swTypeService.getSwTypeById(
        boardParam.swTypeId,
      );

      if (!targetSwType) throw new NotFoundException('Software Type not found');
      newBoard.swType = targetSwType;

      const updatedContent = await this.changeSwVersionContentToUpload(
        boardParam.content,
      );
      newBoard.content = updatedContent;

      if (newBoard.boardType === 'req') {
        const allMaintainer =
          await this.swMaintainerService.getMaintainerBySwTypeId(
            boardParam.swTypeId,
          );

        await this.mQue.add(E_SendToQue.email, {
          sendType: E_SendType.inquery,
          user: allMaintainer.map((maintainer) => maintainer.user),
          swType: targetSwType,
        });
      }

      return await this.boardRepository.save(newBoard);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        switch (error.driverError.code) {
          case '23505':
            throw new ConflictException('version Title already exists');
          case '22P02':
            throw new UnprocessableEntityException(
              `Invalid input: ${error.message}`,
            );
        }
      }
      throw error;
    }
  }

  private async changeSwVersionContentToUpload(
    content: string,
  ): Promise<string> {
    const { JSDOM } = jsdom;
    const dom = new JSDOM(content, {
      contentType: 'text/html',
      includeNodeLocations: true,
    });
    const document = dom.window.document;
    const imgElements = document.querySelectorAll('img');
    for (const editorImg of imgElements) {
      let imgSize = {
        ...(editorImg.style.width && {
          w: Number(editorImg.style.width.replace(/px$/, '')),
        }),
        ...(editorImg.style.height && {
          h: Number(editorImg.style.height.replace(/px$/, '')),
        }),
      };
      if (editorImg.src.includes('data:image')) {
        const uploadedImg = await this.uploadsService.uploadImageFromTextEditor(
          editorImg.src,
          imgSize,
        );
        editorImg.src = uploadedImg;
      }
    }

    const updatedHtmlContent = document.body.innerHTML;
    return updatedHtmlContent;
  }
}
