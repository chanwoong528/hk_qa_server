import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService
  ) { }

  sendVerificationMail(user: User, token: string): void {
    this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get<string>('MAIL_USER'),
      subject:
        '[HK-QA] Please verify your email address',
      template: "verifyUserConfirmation",
      context: {
        username: user.username,
        token: token,
        homepageUrl: this.configService.get<string>('HOMEPAGE_URL')
      },
    })
  }
  sendAddedAsTesterMail(receiver: User, swInfo: SwVersion): void {
    this.mailerService.sendMail({
      to: receiver.email,
      from: this.configService.get<string>('MAIL_USER'),
      subject:
        '[HK-QA] You have been added as a tester',
      template: "addedAsTester",
      context: {
        username: receiver.username,
        swInfo: swInfo,
        homepageUrl: this.configService.get<string>('HOMEPAGE_URL')
      },
    })
  }




}