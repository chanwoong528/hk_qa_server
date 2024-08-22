import { MailerModule } from '@nestjs-modules/mailer';

import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST'), // 이메일을 보낼 SMTP 서버의 주소
          port: Number(config.get('SMTP_PORT')),
          auth: {
            user: config.get<string>('SMTP_AUTH_EMAIL'), // SMTP 서버 인증을 위한 이메일
            pass: config.get<string>('SMTP_AUTH_PW') // SMTP 서버 인증을 위한 비밀번호
          },
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>'
        },
        preview: true,
        // template: {
        //   dir: path.join(__dirname, 'templates'),

        //   adapter: new HandlebarsAdapter(),
        //   options: {
        //     strict: true,
        //   },
        // }
      })
    })
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule { }