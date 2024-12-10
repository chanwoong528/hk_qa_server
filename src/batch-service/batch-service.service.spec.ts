import { Test, TestingModule } from '@nestjs/testing';
import { BatchServiceService } from './batch-service.service';

describe('BatchServiceService', () => {
  let service: BatchServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BatchServiceService],
    }).compile();

    service = module.get<BatchServiceService>(BatchServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
