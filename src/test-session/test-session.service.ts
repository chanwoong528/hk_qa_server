import { ConflictException, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { TestSession } from './test-session.entity';
import { QueryFailedError, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTestSessionDto, UpdateTestSessionDto } from './test-session.dto';
import { UserRepository } from 'src/user/user.repository';
import { SwVersionService } from 'src/sw-version/sw-version.service';

@Injectable()
export class TestSessionService {

  constructor(
    @InjectRepository(TestSession)
    private readonly testSessionRepository: Repository<TestSession>,
    private readonly userRepository: UserRepository,
    private readonly swVersionService: SwVersionService,

  ) { }

  async getTestSessions(): Promise<TestSession[]> {
    return await this.testSessionRepository.find();
  }

  async getTestSessionById(testSessionId: string): Promise<TestSession> {
    return await this.testSessionRepository.findOne({ relations: ['user'], where: { sessionId: testSessionId } });
  }

  async assignTestSession(testSession: CreateTestSessionDto, testOwnerId: string): Promise<TestSession> {
    try {
      const targetSwVersion = await this.swVersionService.getSwVersionById(testSession.swVersionId);
      if (!targetSwVersion) {
        throw new NotFoundException('Software Version not found');
      } // Check if the software version exists
      if (targetSwVersion.user.id !== testOwnerId) {
        throw new UnauthorizedException('You are not the owner of the software version')
      }// Check if the user is the owner of the software version

      const tester = await this.userRepository.findOneByUUID(testSession.userId);
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
      throw error
    }
  }

  async updateTestSession(
    testSessionId: string, testSession: UpdateTestSessionDto
  ): Promise<UpdateResult> {
    try {
      const targetTestSession = await this.getTestSessionById(testSessionId);
      if (!targetTestSession) {
        throw new NotFoundException('Test Session not found');
      }

      return await this.testSessionRepository.update(testSessionId, testSession);
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
      throw error
    }


  }



}
