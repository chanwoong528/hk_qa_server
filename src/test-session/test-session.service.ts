import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as jsdom from 'jsdom';

import { TestSession } from './test-session.entity';
import { QueryFailedError, Repository, UpdateResult, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateTestSessionDto,
  PutTestSessionListDto,
  UpdateTestSessionDto,
} from './test-session.dto';

import { UserRepository } from 'src/user/user.repository';
import { SwVersionService } from 'src/sw-version/sw-version.service';
import { E_LogType, E_SendToQue, E_SendType, E_TestStatus } from 'src/enum';
import { UploadsService } from 'src/uploads/uploads.service';
import { LogService } from 'src/log/log.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TestSessionService {
  constructor(
    @InjectRepository(TestSession)
    private readonly testSessionRepository: Repository<TestSession>,
    private readonly userRepository: UserRepository,
    private readonly swVersionService: SwVersionService,
    private readonly uploadsService: UploadsService,
    private readonly logService: LogService,

    @InjectQueue('queue')
    private readonly mQue: Queue,
  ) {}

  async getTestSessions(): Promise<TestSession[]> {
    return await this.testSessionRepository.find();
  }

  async getTestSessionsBySwVersionId(swVersionId: string) {
    return await this.testSessionRepository.find({
      relations: ['user'],
      where: { swVersion: { swVersionId: swVersionId } },
    });
  }

  async getTestSessionById(testSessionId: string): Promise<TestSession> {
    return await this.testSessionRepository.findOne({
      relations: ['user'],
      where: { sessionId: testSessionId },
    });
  }

  async getAllTestSessionsPending() {
    return await this.testSessionRepository
      .createQueryBuilder('testSession')
      .leftJoinAndSelect('testSession.user', 'user')
      .leftJoinAndSelect('testSession.swVersion', 'swVersion')
      .leftJoinAndSelect('swVersion.swType', 'swType')
      .where('testSession.status = :status', { status: E_TestStatus.pending })
      .select([
        'testSession',
        'user',
        'swVersion.swVersionId',
        'swVersion.versionTitle',
        'swType',
      ])
      .getMany();
  }

  async assignTestSession(
    testSession: CreateTestSessionDto,
    testOwnerId: string,
  ): Promise<TestSession> {
    try {
      const targetSwVersion = await this.swVersionService.getSwVersionById(
        testSession.swVersionId,
      );
      if (!targetSwVersion) {
        throw new NotFoundException('Software Version not found');
      } // Check if the software version exists
      if (targetSwVersion.user.id !== testOwnerId) {
        throw new UnauthorizedException(
          'You are not the owner of the software version',
        );
      } // Check if the user is the owner of the software version

      const tester = await this.userRepository.findOneByUUID(
        testSession.userId,
      );
      if (!tester) {
        throw new NotFoundException('User not found');
      } // Check if the user exists

      let createdTestSession = new TestSession();
      createdTestSession.user = tester;
      createdTestSession.swVersion = targetSwVersion;

      return await this.testSessionRepository.save(createdTestSession);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        switch (error.driverError.code) {
          case '23505':
            throw new ConflictException('Test already Assign to same user');
          case '22P02':
            throw new UnprocessableEntityException(
              `Invalid input: ${error.message}`,
            );
        }
      }
      throw error;
    }
  }

  async updateTestSession(
    testSessionId: string,
    testSession: UpdateTestSessionDto,
  ): Promise<UpdateResult> {
    try {
      const targetTestSession = await this.getTestSessionById(testSessionId);
      if (!targetTestSession) {
        throw new NotFoundException('Test Session not found');
      }
      const targetSwVersion = await this.swVersionService.getSwVersionById(
        targetTestSession.swVersion.swVersionId,
      );
      if (!targetSwVersion) {
        throw new NotFoundException('Software Version not found');
      }

      const objTestSession = new TestSession(testSession);
      if (
        testSession.status === E_TestStatus.failed ||
        testSession.status === E_TestStatus.passed
      ) {
        if (!testSession.reasonContent)
          throw new UnprocessableEntityException(
            'Reason For TestStatus change is required',
          );

        objTestSession.finishedAt = new Date();
        const { JSDOM } = jsdom;
        const dom = new JSDOM(testSession.reasonContent, {
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
          const uploadedImg =
            await this.uploadsService.uploadImageFromTextEditor(
              editorImg.src,
              imgSize,
            );
          editorImg.src = uploadedImg;
        }
        const updatedHtmlContent = document.body.innerHTML;
        objTestSession.reasonContent = updatedHtmlContent;

        const tobeLogged = await this.getTestSessionById(testSessionId);
        this.logService.postLog({
          logType: E_LogType.testerStatus,
          content: tobeLogged,
        });
      }

      const updatedResult = await this.testSessionRepository.update(
        testSessionId,
        objTestSession,
      );

      // Check if all test sessions are passed and send an email IF all are passed
      const allTestSessions = await this.getTestSessionsBySwVersionId(
        targetTestSession.swVersion.swVersionId,
      );
      const isTestAllPass = await allTestSessions
        .map((testSession) => testSession.status)
        .every((status) => status === E_TestStatus.passed);
      if (isTestAllPass) {
        await this.mQue.add(E_SendToQue.email, {
          sendType: E_SendType.testFinished,
          user: allTestSessions.map((testSession) => testSession.user),
          swVersion: targetSwVersion,
        });
      }

      return updatedResult;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        switch (error.driverError.code) {
          case '23505':
            throw new ConflictException('Test already Assign to same user');
          case '22P02':
            throw new UnprocessableEntityException(
              `Invalid input: ${error.message}`,
            );
        }
      }
      throw error;
    }
  }
  async deleteOrAddTestSessions(
    swVersionId: string,
    testSession: PutTestSessionListDto,
  ): Promise<any> {
    try {
      const targetSwVersion =
        await this.swVersionService.getSwVersionById(swVersionId);
      const promiseArr = [];

      if (testSession.tobeDeletedArr) {
        const deletePromise = await this.testSessionRepository.delete({
          swVersion: { swVersionId },
          user: { id: In(testSession.tobeDeletedArr) },
        });
        promiseArr.push(deletePromise);
      }
      if (testSession.tobeAddedArr) {
        const addPromise = testSession.tobeAddedArr.map(async (userId) => {
          const newTester = await this.userRepository.findOneByUUID(userId);
          let createdTestSession = new TestSession();
          createdTestSession.user = newTester;
          createdTestSession.swVersion = targetSwVersion;
          const addedTester =
            await this.testSessionRepository.save(createdTestSession);
          return addedTester;
        });

        promiseArr.push(await Promise.all(addPromise));

        addPromise.forEach(async (addedTester) => {
          const receiverInfo = (await addedTester).user;
          const swVersion = (await addedTester).swVersion;

          await this.mQue.add(E_SendToQue.email, {
            sendType: E_SendType.testerAdded,
            user: receiverInfo,
            swVersion,
          });
        });
      }
      const result = await Promise.all(promiseArr);

      return result;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        switch (error.driverError.code) {
          case '23505':
            throw new ConflictException('Test already Assign to same user');
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
