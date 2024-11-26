import { Test, TestingModule } from '@nestjs/testing';
import { DeployLogService } from './deploy-log.service';

describe('DeployLogService', () => {
  let service: DeployLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeployLogService],
    }).compile();

    service = module.get<DeployLogService>(DeployLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
