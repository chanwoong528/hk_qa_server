import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TestSession } from './test-session.entity';
import { QueryFailedError, Repository, UpdateResult, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTestSessionDto, PutTestSessionListDto, UpdateTestSessionDto } from './test-session.dto';
import { UserRepository } from 'src/user/user.repository';
import { SwVersionService } from 'src/sw-version/sw-version.service';
import { E_TestStatus } from 'src/enum';
import { User } from 'src/user/user.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class TestSessionService {
  constructor(
    @InjectRepository(TestSession)
    private readonly testSessionRepository: Repository<TestSession>,
    private readonly userRepository: UserRepository,
    private readonly swVersionService: SwVersionService,
    private readonly mailService: MailService,
  ) { }

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

      const objTestSession = new TestSession(testSession);
      if (testSession.status === E_TestStatus.passed) {
        objTestSession.finishedAt = new Date();
      }

      return await this.testSessionRepository.update(
        testSessionId,
        objTestSession,
      );
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
    testSession: PutTestSessionListDto
  ): Promise<any> {
    try {
      const targetSwVersion = new SwVersion({ swVersionId: swVersionId })
      const promiseArr = []

      if (testSession.tobeDeletedArr) {
        const deletePromise = await this.testSessionRepository
          .delete({ swVersion: { swVersionId }, user: { id: In(testSession.tobeDeletedArr) } });
        promiseArr.push(deletePromise)
      }
      if (testSession.tobeAddedArr) {
        const addPromise = testSession.tobeAddedArr.map(async (userId) => {
          const newTester = new User({ id: userId });
          let createdTestSession = new TestSession();
          createdTestSession.user = newTester;
          createdTestSession.swVersion = targetSwVersion;
          const addedTester = await this.testSessionRepository.createQueryBuilder('testSession').insert().into(TestSession).values(createdTestSession).returning('*').execute();

          return addedTester;
        });



        promiseArr.push(await Promise.all(addPromise))
        addPromise.forEach(async (addedTester) => {
          //TODO: 
          console.log(((await addedTester)))
          // const email = (await addedTester).user.email
          // const swTypeId = (await addedTester).swVersion
          // console.log(email, swTypeId)
        })
      }
      const result = await Promise.all(promiseArr)

      return result
    }
    catch (error) {
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
