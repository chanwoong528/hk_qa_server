import { Test, TestingModule } from '@nestjs/testing';
import { SwVersionController } from './sw-version.controller';

describe('SwVersionController', () => {
  let controller: SwVersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwVersionController],
    }).compile();

    controller = module.get<SwVersionController>(SwVersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
