import { Test, TestingModule } from '@nestjs/testing';
import { SwTypeController } from './sw-type.controller';

describe('SwTypeController', () => {
  let controller: SwTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwTypeController],
    }).compile();

    controller = module.get<SwTypeController>(SwTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
