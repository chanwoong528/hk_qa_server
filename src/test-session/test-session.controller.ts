import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { TestSessionService } from './test-session.service';
import { TestSession } from './test-session.entity';
import { CreateTestSessionDto, UpdateTestSessionDto } from './test-session.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UpdateResult } from 'typeorm';

@Controller('test-session')
export class TestSessionController {

  constructor(private readonly testSessionService: TestSessionService) { }


  @Get()
  async getTestSessions(): Promise<TestSession[]> {
    return await this.testSessionService.getTestSessions();
  }

  @Post()
  @UseGuards(AuthGuard)
  async creteTestSessionWithVersionID(
    @Body() testParam: CreateTestSessionDto,
    @Request() req
  ): Promise<TestSession> {
    console.log("@#!#!@$!#$!#")
    const { sub } = req.user;

    return await this.testSessionService
      .assignTestSession({ userId: testParam.userId, swVersionId: testParam.swVersionId }, sub);
  }

  @Patch(":testSessionId")
  @UseGuards(AuthGuard)
  async updateTestSession(
    @Param('testSessionId', ParseUUIDPipe) testSessionId: string,
    @Body() testSession: UpdateTestSessionDto
  ): Promise<UpdateResult> {
    return await this.testSessionService.updateTestSession(testSessionId, testSession);


  }




}
