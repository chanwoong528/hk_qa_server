import { Test, TestingModule } from '@nestjs/testing';
import { DeployLogController } from './deploy-log.controller';

describe('DeployLogController', () => {
  let controller: DeployLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeployLogController],
    }).compile();

    controller = module.get<DeployLogController>(DeployLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
