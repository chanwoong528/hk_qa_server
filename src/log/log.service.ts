import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QAlog } from './log.entity';
import { Repository } from 'typeorm';


@Injectable()
export class LogService {

  constructor(
    @InjectRepository(QAlog) private readonly logRepository: Repository<QAlog>
  ) { }

  async getLogsByUserId(userId: string): Promise<QAlog[]> {
    return await this.logRepository.createQueryBuilder('QAlog')
      .select()
      .where("QAlog.content ::jsonb @> :content", {
        content: {
          user: {
            id: userId
          }
        }
      })
      .getMany();

  }

  async postLog(log: Partial<QAlog>): Promise<QAlog> {
    return await this.logRepository.save(log);
  }

}
