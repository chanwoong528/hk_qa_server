import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeployLog } from './deploy-log.entity';
import { Repository } from 'typeorm';
import { JenkinsDeploymentService } from 'src/jenkins-deployment/jenkins-deployment.service';
import { UserService } from 'src/user/user.service';
import axios from 'axios';
import { E_DeployStatus, E_JenkinsUrlType } from 'src/enum';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { SseService } from 'src/sse/sse.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeployLogService {
  // ex jenkins POST url https://home-jenkins.hankookilbo.com/view/10.FRONT%20END%20ITEMS/job/hk-homepage-front-dev-all/build
  // ex jenkins POST URL https://herb-jenkins.hankookilbo.com/view/1.%20DEV_BUILD_DEPLOY/job/dev-vms-CLIENT/api/json?tree=nextBuildNumber
  constructor(
    @InjectRepository(DeployLog)
    private deployLogRepository: Repository<DeployLog>,
    private jenkinsDeploymentService: JenkinsDeploymentService,
    private userService: UserService,
    private schedulerRegistry: SchedulerRegistry,
    private sseService: SseService,
    private configService: ConfigService,
  ) {}

  private getJenkinsCredentials(jenkinsUrl: string) {
    return {
      credentialInfo: {
        username: jenkinsUrl.includes('https://home-jenkins.hankookilbo.com')
          ? this.configService.get('JENKINS_USERNAME')
          : this.configService.get('JENKINS_USERNAME_HERB'),
        password: jenkinsUrl.includes('https://home-jenkins.hankookilbo.com')
          ? this.configService.get('JENKINS_API_TOKEN')
          : this.configService.get('JENKINS_API_TOKEN_HERB'),
      },
      jenkinsCrumb: jenkinsUrl.includes('https://home-jenkins.hankookilbo.com')
        ? this.configService.get('JENKINS_CRUMB')
        : this.configService.get('JENKINS_CRUMB_HERB'),
    };
  }

  addCronJob(buildNumber: number, jenkinsUrl: string) {
    const name = `deploy-log-job-${jenkinsUrl}-${buildNumber}`;

    const job = new CronJob('*/10 * * * * *', async () => {
      const fetchBuildInfo = await axios
        .get(`${jenkinsUrl}/${buildNumber}${E_JenkinsUrlType.GET_buildList}`, {
          auth: this.getJenkinsCredentials(jenkinsUrl).credentialInfo,
        })
        .then((res) => {
          const buildInfo = res.data;

          if (
            buildInfo.building === false &&
            buildInfo.inProgress === false &&
            !!buildInfo.result
          ) {
            switch (buildInfo.result) {
              case 'SUCCESS':
                this.updateDeployLogStatus(
                  buildNumber,
                  jenkinsUrl,
                  E_DeployStatus.success,
                );
                break;

              case 'FAILURE':
                this.updateDeployLogStatus(
                  buildNumber,
                  jenkinsUrl,
                  E_DeployStatus.failed,
                );
                break;

              case 'ABORTED':
                this.updateDeployLogStatus(
                  buildNumber,
                  jenkinsUrl,
                  E_DeployStatus.aborted,
                );
                break;
              
              case 'UNSTABLE':
                this.updateDeployLogStatus(
                  buildNumber,
                  jenkinsUrl,
                  E_DeployStatus.unstable,
                );
                break;
            }
            this.schedulerRegistry.getCronJob(name).stop();
          }
        })
        .catch((err) => {
          console.error('err', err.response.status);
          if (err.response.status === 404) {
          } else {
            this.schedulerRegistry.getCronJob(name).stop();
          }
        });
    });
    this.schedulerRegistry.addCronJob(name, job);
  }

  async getDeployLogByTag(tag: string): Promise<DeployLog> {
    return await this.deployLogRepository.findOne({
      where: {
        tag: tag,
      },
    });
  }

  async getAllDeployLogsPending(): Promise<DeployLog[]> {
    return await this.deployLogRepository.find({
      where: {
        status: E_DeployStatus.pending,
      },
      relations: ['jenkinsDeployment'],
    });
  }

  async createDeployLog(
    param: {
      jenkinsDeploymentId: string;
      tag: string;
      reason: string;
    },

    userId: string,
  ): Promise<any> {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const jenkinsDeployment =
      await this.jenkinsDeploymentService.getJenkinsDeploymentById(
        param.jenkinsDeploymentId,
      );

    if (!jenkinsDeployment)
      throw new NotFoundException('Jenkins Deployment not found');

    const fetchNextBuild = await axios.get(
      jenkinsDeployment.jenkinsUrl + E_JenkinsUrlType.GET_nextBuildNumber,
      {
        auth: this.getJenkinsCredentials(jenkinsDeployment.jenkinsUrl)
          .credentialInfo,
      },
    );

    const newBuildNumber = (await fetchNextBuild.data.nextBuildNumber) || 1;

    const existDeployLogThroughTag = await this.getDeployLogByTag(param.tag);

    const deployLog = new DeployLog();
    deployLog.buildNumber = newBuildNumber;
    deployLog.jenkinsDeployment = jenkinsDeployment;
    deployLog.user = user;
    deployLog.tag = `${param.tag}-${newBuildNumber}`;
    deployLog.reason = param.reason;

    const fetchPostNewBuild = await axios.post(
      jenkinsDeployment.jenkinsUrl + E_JenkinsUrlType.POST_buildWithParam,
      {},
      {
        headers: {
          'Jenkins-Crumb': this.getJenkinsCredentials(
            jenkinsDeployment.jenkinsUrl,
          ).jenkinsCrumb,
        },
        auth: this.getJenkinsCredentials(jenkinsDeployment.jenkinsUrl)
          .credentialInfo,
        params: {
          TAG: `${param.tag}-${newBuildNumber}`,
          force: !!existDeployLogThroughTag ? false : true,
        },
      },
    );

    const newSavedDeployLog = await this.deployLogRepository.save(deployLog);

    if (fetchPostNewBuild.status < 300) {
      this.addCronJob(newBuildNumber, jenkinsDeployment.jenkinsUrl);
      const name = `deploy-log-job-${jenkinsDeployment.jenkinsUrl}-${newBuildNumber}`;
      this.schedulerRegistry.getCronJob(name).start();
    }

    return newSavedDeployLog;
  }

  async updateDeployLogStatus(
    buildNumber: number,
    jenkinsUrl: string,
    status: E_DeployStatus,
  ) {
    const targetDeployLog = await this.deployLogRepository.findOne({
      where: {
        buildNumber: buildNumber,
        jenkinsDeployment: {
          jenkinsUrl: jenkinsUrl,
        },
      },
      relations: {
        jenkinsDeployment: {
          swType: true, // swType 관계도 포함
        },
      },
    });
    console.log('targetDeployLog>> ', targetDeployLog);

    if (!targetDeployLog) throw new NotFoundException('Deploy log not found');

    targetDeployLog.status = status;
    this.sseService.emitJenkinsStatusEvent(
      targetDeployLog.jenkinsDeployment.swType.swTypeId,
    );
    return await this.deployLogRepository.save(targetDeployLog);
  }
}
