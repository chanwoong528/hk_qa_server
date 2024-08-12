import { Module } from '@nestjs/common';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QAlog } from './log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QAlog])],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService]
})
export class LogModule { }
