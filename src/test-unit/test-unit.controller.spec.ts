import { Test, TestingModule } from '@nestjs/testing';
import { TestUnitController } from './test-unit.controller';

describe('TestUnitController', () => {
  let controller: TestUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestUnitController],
    }).compile();

    controller = module.get<TestUnitController>(TestUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
