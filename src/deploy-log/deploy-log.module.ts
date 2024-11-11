import { Module } from '@nestjs/common';
import { DeployLogController } from './deploy-log.controller';
import { DeployLogService } from './deploy-log.service';
import { DeployLog } from './deploy-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JenkinsDeploymentModule } from 'src/jenkins-deployment/jenkins-deployment.module';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { SseService } from 'src/sse/sse.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeployLog]),
    ScheduleModule.forRoot(),
    JenkinsDeploymentModule,
  ],
  controllers: [DeployLogController],
  providers: [DeployLogService, UserRepository, UserService, SseService],
  exports: [DeployLogService],
})
export class DeployLogModule {}
