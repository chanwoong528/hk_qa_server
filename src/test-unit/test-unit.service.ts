import { Injectable } from '@nestjs/common';
import { TestUnit } from './test-unit.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TestUnitService {

  constructor(
    @InjectRepository(TestUnit)
    private readonly testUnitRepository: Repository<TestUnit>,
  ) { }

  async createTestUnit(testUnit: Partial<TestUnit>): Promise<TestUnit> {
    return await this.testUnitRepository.save(testUnit);
  }

  async createTestUnitList(testUnitList: Partial<TestUnit>[]): Promise<TestUnit[]> {
    const postTestUnitPromise = testUnitList.map(testUnit => {
      return this.createTestUnit(testUnit);
    });
    return await Promise.all(postTestUnitPromise)
  }
}
