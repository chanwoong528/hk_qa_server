import {
  Catch,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SwVersion } from './sw-version.entity';
import { QueryFailedError, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { SwTypeService } from 'src/sw-type/sw-type.service';

import { CreateSwVersionDto, UpdateSwVersionDto } from './sw-version.dto';
import * as jsdom from 'jsdom';
import { UploadsService } from 'src/uploads/uploads.service';

@Injectable()
export class SwVersionService {
  constructor(
    @InjectRepository(SwVersion)
    private readonly swVersionRepository: Repository<SwVersion>,
    private readonly userRepository: UserRepository,
    private readonly swTypeService: SwTypeService,
    private readonly uploadsService: UploadsService,
  ) {}

  //GET_ALL based on swType
  async getSwVersions(swTypeId: string): Promise<SwVersion[]> {
    return await this.swVersionRepository.find({
      relations: ['swType', 'user', 'testSessions', 'testUnits'],
      where: { swType: { swTypeId: swTypeId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getSwVersionById(swVersionId: string): Promise<SwVersion> {
    return await this.swVersionRepository.findOne({
      relations: ['swType', 'user'],
      where: { swVersionId: swVersionId },
    });
  }

  async createSwVersion(
    swVersion: CreateSwVersionDto,
    userId: string,
  ): Promise<SwVersion> {
    try {
      const author = await this.userRepository.findOneByUUID(userId);
      if (!author) {
        throw new NotFoundException('User not found');
      }

      const targetSwType = (await this.swTypeService.getSwTypes()).find(
        (swType) => swType.swTypeId === swVersion.swTypeId,
      );
      if (!targetSwType) {
        throw new NotFoundException('Software Type not found');
      }

      let createdSwVersion = new SwVersion(swVersion);
      createdSwVersion.user = author;
      createdSwVersion.swType = targetSwType;

      const { JSDOM } = jsdom;
      const dom = new JSDOM(swVersion.versionDesc, {
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
        const uploadedImg = await this.uploadsService.uploadImageFromTextEditor(
          editorImg.src,
          imgSize,
        );
        editorImg.src = uploadedImg;
      }
      const updatedHtmlContent = document.body.innerHTML;
      createdSwVersion.versionDesc = updatedHtmlContent;

      return await this.swVersionRepository.save(createdSwVersion);
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

  async updateSwVersionById(
    id: string,
    swVersion: UpdateSwVersionDto,
  ): Promise<any> {
    try {
      return await this.swVersionRepository.update(id, swVersion);
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
}
