import { Module } from '@nestjs/common';
import { JenkinsDeploymentController } from './jenkins-deployment.controller';
import { JenkinsDeploymentService } from './jenkins-deployment.service';
import { JenkinsDeployment } from './jenkins-deployment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwTypeModule } from 'src/sw-type/sw-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([JenkinsDeployment]), SwTypeModule],
  controllers: [JenkinsDeploymentController],
  providers: [JenkinsDeploymentService],
  exports: [JenkinsDeploymentService],
})
export class JenkinsDeploymentModule {}
