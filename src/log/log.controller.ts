import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { LogService } from './log.service';
import { QAlog } from './log.entity';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {
  }
  @Get(':versionId')
  async getLogsByUserId(
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @Query('userId', ParseUUIDPipe) userId: string
  ): Promise<QAlog[]> {
    return await this.logService.getLogsByUserId(userId, versionId);
  }

}
