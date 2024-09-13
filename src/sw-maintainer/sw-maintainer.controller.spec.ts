import { Test, TestingModule } from '@nestjs/testing';
import { SwMaintainerController } from './sw-maintainer.controller';

describe('SwMaintainerController', () => {
  let controller: SwMaintainerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwMaintainerController],
    }).compile();

    controller = module.get<SwMaintainerController>(SwMaintainerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
