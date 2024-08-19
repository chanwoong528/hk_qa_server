import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { E_SendToQue } from "./enum";
import { MailService } from "./mail/mail.service";


@Processor('queue')
export class AppConsumer extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
  ) {
    super();
  }
  private readonly logger = new Logger(AppConsumer.name);

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case E_SendToQue.email: {
        this.logger.log('Start processing job email ' + job.id);

        this.mailService.sendMailWrapFunction(
          job.data.sendType,
          job.data.user ? job.data.user : undefined,
          job.data.token ? job.data.token : undefined,
          job.data.swVersion ? job.data.swVersion : undefined
        );

        return {
          message: 'Email sent!',
        };
      }
      case E_SendToQue.teams: {
        this.logger.log('Start processing job teams ' + job.id);
      }

    }
  }
}