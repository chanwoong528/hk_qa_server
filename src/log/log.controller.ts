import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { LogService } from './log.service';
import { QAlog } from './log.entity';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {
  }
  @Get(':userId')
  async getLogsByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<QAlog[]> {
    return await this.logService.getLogsByUserId(userId);
  }

}
