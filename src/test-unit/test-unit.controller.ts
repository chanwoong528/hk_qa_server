import { Body, Controller, Request, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { TestUnitService } from './test-unit.service';
import { TestUnit } from './test-unit.entity';
import { SwVersionService } from 'src/sw-version/sw-version.service';
import { AuthGuard } from 'src/common/guard/auth.guard';

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

    if (!targetSwVersion) {
      throw new Error('Invalid swVersionId');
    }

    const postTestUnitPromise = testUnitList.map(testUnit => {
      testUnit.swVersion = targetSwVersion
      testUnit.user = sub
      return this.testUnitService.createTestUnit(testUnit);
    })

    return await Promise.all(postTestUnitPromise);
  }
}
