import { Module } from '@nestjs/common';
import { DeployLogController } from './deploy-log.controller';
import { DeployLogService } from './deploy-log.service';
import { DeployLog } from './deploy-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JenkinsDeploymentModule } from 'src/jenkins-deployment/jenkins-deployment.module';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DeployLog]), JenkinsDeploymentModule],
  controllers: [DeployLogController],
  providers: [DeployLogService, UserRepository, UserService],
  exports: [DeployLogService],
})
export class DeployLogModule {}
