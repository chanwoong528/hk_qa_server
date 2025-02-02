import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { InjectBrowser } from 'nestjs-playwright';
import { Browser } from 'playwright';
import { DeployLogService } from 'src/deploy-log/deploy-log.service';
import { E_DeployStatus, E_JenkinsUrlType } from 'src/enum';
import { MailService } from 'src/mail/mail.service';

import { TestSessionService } from 'src/test-session/test-session.service';

@Injectable()
export class BatchServiceService {
  constructor(
    private readonly testSessionService: TestSessionService,

    private readonly deployLogService: DeployLogService,

    private readonly mailService: MailService,

    private readonly configService: ConfigService,

    @InjectBrowser()
    private readonly browser: Browser,
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

  @Cron(
    // `* * * * *`,
    CronExpression.EVERY_10_SECONDS,
    { name: 'hk-homepage-monitor' },
  )
  async hkHomepageMonitor() {
    const browser = await this.browser.newContext();
    const page = await browser.newPage();
    await page.goto('https://www.hankookilbo.com/');
    await page.waitForSelector('.tab-list ul li');

    // const screenshot = await page.screenshot({ path: 'screenshot.png' });
    const htmlContent = await page.content();

    // const tabListItems = await tabList.locator('li');

    console.log('htmlContent>> ', htmlContent);
  }
}
