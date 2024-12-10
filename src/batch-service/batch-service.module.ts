import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchServiceService } from './batch-service.service';
import { TestSessionModule } from 'src/test-session/test-session.module';
import { TestSessionService } from 'src/test-session/test-session.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TestSessionModule, MailModule],
  providers: [BatchServiceService],
})
export class BatchServiceModule {}
