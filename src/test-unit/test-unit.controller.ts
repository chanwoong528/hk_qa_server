import { Body, Controller, Request, Param, ParseUUIDPipe, Post, UseGuards, Get, Patch, NotFoundException } from '@nestjs/common';
import { TestUnitService } from './test-unit.service';
import { TestUnit } from './test-unit.entity';
import { SwVersionService } from 'src/sw-version/sw-version.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { User } from 'src/user/user.entity';

@Controller('test-unit')
export class TestUnitController {
  constructor(
    private readonly testUnitService: TestUnitService,
    private readonly swVersionService: SwVersionService
  ) { }

  @UseGuards(AuthGuard)
  @Post(':swVersionId')
  async createTestUnits(
    @Param('swVersionId', ParseUUIDPipe) swVersionId: string,
    @Body() testUnitList: Partial<TestUnit[]>,
    @Request() req
  ): Promise<TestUnit[]> {
    const { sub } = req.user;
    const targetSwVersion = await this.swVersionService.getSwVersionById(swVersionId);

    if (!targetSwVersion) throw new NotFoundException('Invalid swVersionId');


    const postTestUnitPromise = testUnitList.map(testUnit => {
      testUnit.swVersion = targetSwVersion
      testUnit.user = new User({ id: sub })
      return this.testUnitService.createTestUnit(testUnit);
    })

    return await Promise.all(postTestUnitPromise);
  }

  @UseGuards(AuthGuard)
  @Get(':swVersionId')
  async getTestUnits(
    @Param('swVersionId', ParseUUIDPipe) swVersionId: string
  ): Promise<TestUnit[]> {
    console.log('swVersionId', swVersionId);
    return await this.testUnitService.getTestUnitsBySwVersionId(swVersionId);
  }


  @UseGuards(AuthGuard)
  @Patch(':swVersionId')
  async updateTestUnits(
    @Param('swVersionId', ParseUUIDPipe) swVersionId: string,
    @Body() tobeLastUnitTestList: Partial<TestUnit>[],
    @Request() req
  ): Promise<any> {
    try {
      const { sub } = req.user;

      const targetSwVersion = await this.swVersionService.getSwVersionById(swVersionId);
      if (!targetSwVersion) throw new NotFoundException('Invalid swVersionId');

      const newParamUnitTestList = tobeLastUnitTestList.map(testUnit => {
        testUnit.swVersion = targetSwVersion

        if (!testUnit.user) testUnit.user = new User({ id: sub })
        return testUnit
      })

      const updateCreatedDeleteEditVersionTestUnitList = await this.testUnitService.patchTestUnitList(newParamUnitTestList, swVersionId);

      return updateCreatedDeleteEditVersionTestUnitList
    } catch (error) {

      console.log('error', error);
    }

  }
}
