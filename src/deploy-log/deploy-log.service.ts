import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeployLog } from './deploy-log.entity';
import { Repository } from 'typeorm';
import { JenkinsDeploymentService } from 'src/jenkins-deployment/jenkins-deployment.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DeployLogService {
  // ex jenkins POST url https://home-jenkins.hankookilbo.com/view/10.FRONT%20END%20ITEMS/job/hk-homepage-front-dev-all/build

  constructor(
    @InjectRepository(DeployLog)
    private deployLogRepository: Repository<DeployLog>,
    private jenkinsDeploymentService: JenkinsDeploymentService,
    private userService: UserService,
  ) {}

  async createDeployLog(jenkinsDeployId: string, userId: string): Promise<any> {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const jenkinsDeployment =
      await this.jenkinsDeploymentService.getJenkinsDeploymentById(
        jenkinsDeployId,
      );

    if (!jenkinsDeployment)
      throw new NotFoundException('Jenkins Deployment not found');

    const deployLog = new DeployLog();
    deployLog.jenkinsDeployment = jenkinsDeployment;

    return await this.deployLogRepository.save(deployLog);
  }
}
