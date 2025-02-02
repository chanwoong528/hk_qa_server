import { Module } from '@nestjs/common';
import { BatchServiceService } from './batch-service.service';
import { TestSessionModule } from 'src/test-session/test-session.module';
import { MailModule } from 'src/mail/mail.module';
import { DeployLogModule } from 'src/deploy-log/deploy-log.module';
import { PlaywrightModule } from 'nestjs-playwright';
@Module({
  imports: [
    TestSessionModule,
    MailModule,
    DeployLogModule,
    PlaywrightModule.forRoot({
      headless: true,
      channel: 'chrome',
      isGlobal: true,
    }),
  ],
  providers: [BatchServiceService],
})
export class BatchServiceModule {}
