import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService
  ) { }



  sendSignUpCongratMail(to: string): void {
    this.mailerService
      .sendMail({
        to,
        from: this.configService.get<string>('MAIL_USER'),
        subject:
          '[tellmeaboutyourcareer] Congratulations on signing up for Our service!',
        text: 'welcome'
        // html: '<b>welcome</b>' // HTML body content
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  sendVerficationMail(user: User, token: string): void {
    this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get<string>('MAIL_USER'),
      subject:
        '[HK-QA] Please verify your email address',
      template: "verifyUserConfirmation",
      context: {
        username: user.username,
        token: token
      },
    })
  }
  sendAddedAsTesterMail(to: string): void {
    this.mailerService.sendMail({
      to: to,
      from: this.configService.get<string>('MAIL_USER'),
      subject:
        '[HK-QA] Please verify your email address',
      template: "verifyUserConfirmation",
      context: {
        username: to,
      },
    })


  }




}