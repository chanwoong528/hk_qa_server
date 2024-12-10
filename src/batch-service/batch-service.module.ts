import { Module } from '@nestjs/common';
import { BatchServiceService } from './batch-service.service';
import { TestSessionModule } from 'src/test-session/test-session.module';
import { MailModule } from 'src/mail/mail.module';
import { DeployLogModule } from 'src/deploy-log/deploy-log.module';

@Module({
  imports: [TestSessionModule, MailModule, DeployLogModule],
  providers: [BatchServiceService],
})
export class BatchServiceModule {}
