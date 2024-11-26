import { Test, TestingModule } from '@nestjs/testing';
import { JenkinsDeploymentController } from './jenkins-deployment.controller';

describe('JenkinsDeploymentController', () => {
  let controller: JenkinsDeploymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JenkinsDeploymentController],
    }).compile();

    controller = module.get<JenkinsDeploymentController>(JenkinsDeploymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
