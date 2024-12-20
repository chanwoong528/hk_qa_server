import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { render } from '@react-email/render';

import { User } from 'src/user/user.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';
import { E_SendToQue, E_SendType } from 'src/enum';

import AddedAsTester from './templates/emails/AddedAsTester';
import ForGotPassword from './templates/emails/ForgotPassword';
import TestFinished from './templates/emails/TestFinished';
import VerifyUserConfirmation from './templates/emails/VerifyUserConfirmation';
import PostedInquery from './templates/emails/PostedInquery';
import PendingTestSession from './templates/emails/PendingTestSession';

import { SwType } from 'src/sw-type/sw-type.entity';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
    private jwtService: JwtService,

    @InjectQueue('queue')
    private readonly mQue: Queue,
  ) {}

  private readonly TEAMS_URL =
    'https://prod2-01.southeastasia.logic.azure.com:443/workflows/ed6732f462cc46bcbf444511cc55eb6b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Y9fceOlwg8KS3xGtNMDvvrCIXO80oj7gHSbOTdtPyn0';

  private readonly EMAIL_HEADER_LOGO = '[한국일보 - Qing]';

  private readonly HTML_LOGO_IMG =
    '<img height="88" src="https://hk-qa-bucket.s3.ap-northeast-2.amazonaws.com/hiq_logo.png" style="display:block;outline:none;border:none;text-decoration:none" width="212" loading="lazy">';

  private generateReactEmail = (template) => {
    const redneredTemplate = render(template);
    return redneredTemplate;
  };

  sendTeamsMessage(receiver: User, url: string, htmlMsg: string): void {
    const axiosBody = {
      type: 'message',
      attachments: [
        {
          contentType: this.configService.get<string>('HOMEPAGE_URL') + url,
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: receiver.email,
            body: [
              {
                type: String() + htmlMsg,
              },
            ],
          },
        },
      ],
    };
    axios.post(this.TEAMS_URL, axiosBody);
  }

  sendMailWrapFunction(
    typeEmail: E_SendType,
    to: User | User[],
    token?: string,
    swVersion?: SwVersion,
    swType?: SwType,
  ) {
    switch (typeEmail) {
      case E_SendType.verification:
        this.sendVerificationMail(to as User, token);
        break;

      case E_SendType.forgotPassword:
        this.sendForgotPasswordMail(to as User);
        break;

      case E_SendType.testerAdded:
        this.sendAddedAsTesterMail(to as User, swVersion);
        break;

      case E_SendType.testFinished:
        this.testFinishedMail(to as User[], swVersion);
        break;
      case E_SendType.inquery:
        this.sendToMaintainerInquery(to as User[], swType);
        break;

      default:
        throw new Error('Invalid email send type');
    }
  }
  // ---- no teams msg ----
  sendVerificationMail(user: User, token: string): void {
    const htmlEmail = this.generateReactEmail(
      VerifyUserConfirmation({
        username: user.username,
        token: token,
        homepageUrl: this.configService.get<string>('HOMEPAGE_URL'),
      }),
    );

    this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get<string>('SMTP_AUTH_EMAIL'),
      subject: this.EMAIL_HEADER_LOGO + ' Please verify your email address',
      html: htmlEmail,
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

    const htmlEmail = this.generateReactEmail(
      ForGotPassword({
        username: user.username,
        token: resetPwToken,
        homepageUrl: this.configService.get<string>('HOMEPAGE_URL'),
      }),
    );

    this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get<string>('SMTP_AUTH_EMAIL'),
      subject: this.EMAIL_HEADER_LOGO + ' 비밀번호 초기화 안내',
      html: htmlEmail,
    });
  }
  //____ no teams msg ____

  sendToMaintainerInquery(users: User[], swInfo: SwType) {
    users.forEach((receiver) => {
      const htmlEmail = this.generateReactEmail(
        PostedInquery({
          username: receiver.username,
          swInfo: swInfo,
          homepageUrl: this.configService.get<string>('HOMEPAGE_URL'),
        }),
      );
      this.mailerService.sendMail({
        to: receiver.email,
        from: this.configService.get<string>('SMTP_AUTH_EMAIL'),
        subject:
          this.EMAIL_HEADER_LOGO +
          swInfo.typeTitle +
          '에 문의가 등록되었습니다.',
        html: htmlEmail,
      });
    });

    users.forEach((receiver) => {
      const htmlData =
        this.HTML_LOGO_IMG +
        `<strong>${swInfo.typeTitle}</strong>` +
        '<div>테스터가 문의 / 개발요청을 남겼습니다. </div>';

      this.mQue.add(E_SendToQue.teams, {
        user: receiver,
        url: `/sw-type/${swInfo.swTypeId}`,
        htmlMsg: htmlData,
      });
    });
  }

  sendPendingTestSessionMail(receiver: User, swInfo: SwVersion): void {
    const htmlEmail = this.generateReactEmail(
      PendingTestSession({
        username: receiver.username,
        swInfo: swInfo,
        homepageUrl: this.configService.get<string>('HOMEPAGE_URL'),
      }),
    );

    this.mailerService.sendMail({
      to: receiver.email,
      from: this.configService.get<string>('SMTP_AUTH_EMAIL'),
      subject: this.EMAIL_HEADER_LOGO + ' 진행중인 테스트 세션이 있습니다.',
      html: htmlEmail,
    });
    const htmlData =
      this.HTML_LOGO_IMG +
      '<div>진행중인 테스트 세션이 있습니다. Version:  <strong>' +
      swInfo.versionTitle +
      '</strong></div>';

    this.mQue.add(E_SendToQue.teams, {
      user: receiver,
      url: `/sw-type/${swInfo.swType.swTypeId}?open=${swInfo.swVersionId}`,
      htmlMsg: htmlData,
    });
  }

  sendAddedAsTesterMail(receiver: User, swInfo: SwVersion): void {
    const htmlEmail = this.generateReactEmail(
      AddedAsTester({
        username: receiver.username,
        swInfo: swInfo,
        homepageUrl: this.configService.get<string>('HOMEPAGE_URL'),
      }),
    );

    this.mailerService.sendMail({
      to: receiver.email,
      from: this.configService.get<string>('SMTP_AUTH_EMAIL'),
      subject: this.EMAIL_HEADER_LOGO + ' 테스터로 등록 되셨습니다.',
      html: htmlEmail,
    });

    const htmlData =
      this.HTML_LOGO_IMG +
      '<div>테스터로 등록 되었습니다. Version:  <strong>' +
      swInfo.versionTitle +
      '</strong></div>';

    this.mQue.add(E_SendToQue.teams, {
      user: receiver,
      url: `/sw-type/${swInfo.swType.swTypeId}?open=${swInfo.swVersionId}`,
      htmlMsg: htmlData,
    });
  }

  testFinishedMail(receiverList: User[], swInfo: SwVersion): void {
    receiverList.forEach((receiver) => {
      const htmlEmail = this.generateReactEmail(
        TestFinished({
          username: receiver.username,
          swInfo: swInfo,
          homepageUrl: this.configService.get<string>('HOMEPAGE_URL'),
        }),
      );

      this.mailerService.sendMail({
        to: receiver.email,
        from: this.configService.get<string>('SMTP_AUTH_EMAIL'),
        subject: this.EMAIL_HEADER_LOGO + ' finished',
        html: htmlEmail,
      });
    });

    const htmlData =
      this.HTML_LOGO_IMG +
      '<div>모든 테스터가 QA를 확인했습니다.  Version:  <strong>' +
      swInfo.versionTitle +
      '</strong> 배포 준비해주세요. </div>';

    receiverList.forEach((receiver) =>
      this.mQue.add(E_SendToQue.teams, {
        user: receiver,
        url: `/sw-type/${swInfo.swType.swTypeId}?open=${swInfo.swVersionId}`,
        htmlMsg: htmlData,
      }),
    );
  }
}
