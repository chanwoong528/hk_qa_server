import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from 'src/mail/mail.service';
import { TestSessionService } from 'src/test-session/test-session.service';

@Injectable()
export class BatchServiceService {
  constructor(
    private readonly testSessionService: TestSessionService,
    private readonly mailService: MailService,
  ) {}

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
}
