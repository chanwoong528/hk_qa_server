import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { DeployLogService } from 'src/deploy-log/deploy-log.service';
import { E_DeployStatus, E_JenkinsUrlType } from 'src/enum';
import { MailService } from 'src/mail/mail.service';
import { SwMaintainerService } from 'src/sw-maintainer/sw-maintainer.service';
import { TestSessionService } from 'src/test-session/test-session.service';

@Injectable()
export class BatchServiceService {
  constructor(
    private readonly testSessionService: TestSessionService,

    private readonly deployLogService: DeployLogService,

    private readonly mailService: MailService,

    private readonly configService: ConfigService,
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

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_10AM, { name: 'pendingTestSession' })
  async SendEmailTopendingTestSession() {
    const testSessions =
      await this.testSessionService.getAllTestSessionsPending();

    for (const testSession of testSessions) {
      this.mailService.sendPendingTestSessionMail(
        testSession.user,
        testSession.swVersion,
      );
    }
  }

  @Cron(`*/1 * * * *`, { name: 'pendingDeployLog' })
  async deployLogPendingResolver() {
    const deployLogs = await this.deployLogService.getAllDeployLogsPending();

    for (const deployLog of deployLogs) {
      const fetchBuildUrl = `${deployLog.jenkinsDeployment.jenkinsUrl}/${deployLog.buildNumber}${E_JenkinsUrlType.GET_buildList}`;
      try {
        const fetchBuildInfo = await axios.get(fetchBuildUrl, {
          auth: this.getJenkinsCredentials(
            deployLog.jenkinsDeployment.jenkinsUrl,
          ).credentialInfo,
        });
        const buildInfo = await fetchBuildInfo.data;

        if (!buildInfo.inProgress) {
          //existing in jenkins build but not in our db

          let deployStatParam: E_DeployStatus;
          switch (buildInfo.result) {
            case 'SUCCESS':
              deployStatParam = E_DeployStatus.success;
              break;
            case 'FAILURE':
              deployStatParam = E_DeployStatus.failed;
              break;
            case 'ABORTED':
              deployStatParam = E_DeployStatus.aborted;
              break;
            case 'UNSTABLE':
              deployStatParam = E_DeployStatus.unstable;
              break;
            default:
              throw new Error('Invalid deploy status');
          }
          return await this.deployLogService.updateDeployLogStatus(
            deployLog.buildNumber,
            deployLog.jenkinsDeployment.jenkinsUrl,
            deployStatParam,
          );
        }

        throw new Error('buildInfo.inProgress is true');
      } catch (error) {
        console.error('error>> ', error.message);
        const isDeployStuck =
          deployLog.createdAt.getTime() === deployLog.updatedAt.getTime() &&
          deployLog.status === E_DeployStatus.pending &&
          deployLog.createdAt.getTime() + 20 * 60 * 1000 < Date.now();

        if (isDeployStuck) {
          await this.deployLogService.updateDeployLogStatus(
            deployLog.buildNumber,
            deployLog.jenkinsDeployment.jenkinsUrl,
            E_DeployStatus.timeout,
          );
        }
      }
    }
  }

  // @Cron(
  //   // `* * * * *`,
  //   CronExpression.EVERY_10_SECONDS,
  //   { name: 'healthCheck' },
  // )
  // async healthCheck() {
  //   const isProd = this.configService.get('NODE_ENV') === 'prod';
  //   const serverUrl = isProd
  //     ? 'http://ec2-3-36-178-244.ap-northeast-2.compute.amazonaws.com:5000'
  //     : 'http://localhost:3000';

  //   const response = await axios.get(`${serverUrl}/api/health`);
  //   const data = await response.data;

  //   if (data.status !== 'OK') {
  //     const isAdminSwTypeId = isProd
  //       ? 'cb1aca99-5e4b-4c2d-8ef4-68c10f6df08f'
  //       : '580fa012-0310-4d02-8fd9-7cff7811dc7b';
  //   }
  //   console.log('healthCheck', response.data);

  //   // const response = await axios.get('http://localhost:3000/api/health');
  //   // console.log('healthCheck', response.data);
  // }
}
