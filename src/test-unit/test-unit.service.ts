import { Injectable, NotFoundException } from '@nestjs/common';
import { TestUnit } from './test-unit.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TestUnitService {

  constructor(
    @InjectRepository(TestUnit)
    private readonly testUnitRepository: Repository<TestUnit>,
  ) { }

  async getTestUnitById(testUnitId: string): Promise<TestUnit> {
    if (!testUnitId) throw new NotFoundException('TestUnit not found');

    return await this.testUnitRepository.findOne({
      where: {
        testUnitId: testUnitId
      }
    });
  }

  async getTestUnitsBySwVersionId(swVersionId: string): Promise<TestUnit[]> {
    return await this.testUnitRepository.find({
      relations: ['swVersion', 'reactions', 'reactions.user'],
      where: { swVersion: { swVersionId: swVersionId } },
      order: { createdAt: 'DESC' },
    });
  }


  async createTestUnit(testUnit: Partial<TestUnit>): Promise<TestUnit> {
    return await this.testUnitRepository.save(testUnit);
  }
  async upsertTestUnit(testUnit: Partial<TestUnit>): Promise<any> {
    return await this.testUnitRepository.upsert(testUnit, ['testUnitId']);
  }

  async createTestUnitList(testUnitList: Partial<TestUnit>[]): Promise<TestUnit[]> {
    const postTestUnitPromise = testUnitList.map(testUnit => {
      return this.createTestUnit(testUnit);
    });
    return await Promise.all(postTestUnitPromise)
  }
  async deleteTestUnit(testUnitId: string): Promise<any> {
    return await this.testUnitRepository.delete({ testUnitId: testUnitId });
  }

  async patchTestUnit(testUnitList: Partial<TestUnit>): Promise<any> {
    return await this.testUnitRepository.save(testUnitList);
  }

  async patchTestUnitList(
    tobeLastUnitTestList: Partial<TestUnit>[],
    swVersionId: string
  ): Promise<any> {
    const curTestUnitList = await this.getTestUnitsBySwVersionId(swVersionId);
    let promiseArr = [];

    const tobeDeleted = await curTestUnitList.filter(curTestUnit => !tobeLastUnitTestList.some(testUnit => testUnit.testUnitId === curTestUnit.testUnitId));
    if (tobeDeleted.length > 0) {
      const deleteTestUnitPromise = tobeDeleted.map(testUnit => {
        return this.deleteTestUnit(testUnit.testUnitId);
      })
      promiseArr.push(deleteTestUnitPromise)
    }

    if (tobeLastUnitTestList.length > 0) {
      const patchTestUnitPromise = tobeLastUnitTestList.map(testUnit => {
        return this.createTestUnit(testUnit);
      })
      promiseArr.push(patchTestUnitPromise)
    }

    return await Promise.all(promiseArr)
  }

}
