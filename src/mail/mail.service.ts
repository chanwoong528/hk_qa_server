import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';
import axios from 'axios';
import { SwType } from 'src/sw-type/sw-type.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}
  private readonly TEAMS_URL =
    'https://prod2-01.southeastasia.logic.azure.com:443/workflows/ed6732f462cc46bcbf444511cc55eb6b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Y9fceOlwg8KS3xGtNMDvvrCIXO80oj7gHSbOTdtPyn0';
  sendVerificationMail(user: User, token: string): void {
    this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get<string>('SMTP_AUTH_EMAIL'),
      subject: '[HK-QA] Please verify your email address',
      template: 'verifyUserConfirmation',
      context: {
        username: user.username,
        token: token,
        homepageUrl: this.configService.get<string>('HOMEPAGE_URL'),
      },
    });
  }
  sendAddedAsTesterMail(receiver: User, swInfo: SwVersion): void {
    this.mailerService.sendMail({
      to: receiver.email,
      from: this.configService.get<string>('SMTP_AUTH_EMAIL'),
      subject: '[HK-QA] You have been added as a tester',
      template: 'addedAsTester',
      context: {
        username: receiver.username,
        swInfo: swInfo,
        homepageUrl: this.configService.get<string>('HOMEPAGE_URL'),
      },
    });
    const htmlData =
      '<div>You have been added To Test of <strong>' +
      swInfo.versionTitle +
      '</strong></div>';

    const axiosBody = {
      type: 'message',
      attachments: [
        {
          contentType:
            this.configService.get<string>('HOMEPAGE_URL') +
            `/sw-type/${swInfo.swType.swTypeId}`,
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: receiver.email,
            body: [
              {
                type: String() + htmlData,
              },
            ],
          },
        },
      ],
    };
    axios.post(this.TEAMS_URL, axiosBody);
  }

  testFinishedMail(receiverList: User[], swInfo: SwVersion): void {
    receiverList.forEach((receiver) => {
      this.mailerService.sendMail({
        to: receiver.email,
        from: this.configService.get<string>('SMTP_AUTH_EMAIL'),
        subject: '[HK-QA] Test finished',
        template: 'testFinished',
        context: {
          username: receiver.username,
          swInfo: swInfo,
          homepageUrl: this.configService.get<string>('HOMEPAGE_URL'),
        },
      });
    });
    const htmlData =
      '<div>All Testers marked QA as passed, for Version:  <strong>' +
      swInfo.versionTitle +
      '</strong> Please get ready for deployment. </div>';
    receiverList.forEach((receiver) => {
      const axiosBody = {
        type: 'message',
        attachments: [
          {
            contentType:
              this.configService.get<string>('HOMEPAGE_URL') +
              `/sw-type/${swInfo.swType.swTypeId}`,
            content: {
              $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
              type: 'AdaptiveCard',
              version: receiver.email,
              body: [
                {
                  type: String() + htmlData,
                },
              ],
            },
          },
        ],
      };

      axios.post(this.TEAMS_URL, axiosBody);
    });
  }

  async sendForgotPasswordMail(user: User): Promise<void> {
    const resetPwToken = await this.jwtService.signAsync(
      { id: user.id },
      {
        expiresIn: '1d',
        secret: this.configService.get('JWT_SECRET'),
      },
    );

    this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get<string>('SMTP_AUTH_EMAIL'),
      subject: '[HK-QA] Reset your password',
      template: 'forgotPassword',
      context: {
        username: user.username,
        token: resetPwToken,
        homepageUrl: this.configService.get<string>('HOMEPAGE_URL'),
      },
    });
  }
}
