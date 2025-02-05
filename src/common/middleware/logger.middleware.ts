import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { E_SendToQue } from 'src/enum';
import { SwMaintainerService } from 'src/sw-maintainer/sw-maintainer.service';
import { ConfigService } from '@nestjs/config';

const env = process.env.NODE_ENV || 'development';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  //   private logger = new Logger('HTTP');a

  constructor(
    private readonly swMaintainerService: SwMaintainerService,
    @InjectQueue('queue')
    private readonly mQue: Queue,
    private readonly configService: ConfigService,
  ) {}

  private logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winstonDaily({
        datePattern: 'YYYY-MM-DD',
        dirname: 'logs',
        filename: `%DATE%.log`,
        maxFiles: 30,
        zippedArchive: true,
      }),
    ],
  });

  private convertLoggerStatusCode(code: number) {
    // const levels = { // winston level
    //   error: 0,
    //   warn: 1,
    //   info: 2,
    //   http: 3,
    //   verbose: 4,
    //   debug: 5,
    //   silly: 6,
    // };

    if (code >= 500) {
      return 0;
    }
    if (code >= 400) {
      return 1;
    }
    // if (code >= 300) {
    //   //test code
    //   return 0;
    // }

    return 2;
  }

  use(req: any, res: any, next: () => void) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const { statusCode } = res;

      if (method !== 'GET') {
        const level = ['error', 'warn', 'info'][
          this.convertLoggerStatusCode(statusCode)
        ];
        this.logger.log(
          level,
          `${method} ${originalUrl} ${statusCode} - ${userAgent} ${ip}`,
        );
      }

      if (
        statusCode >= 400 &&
        statusCode !== 404 &&
        statusCode !== 401 &&
        statusCode !== 409
      ) {
        const isProd = this.configService.get('NODE_ENV') === 'prod';

        const isAdminSwTypeId = isProd
          ? 'cb1aca99-5e4b-4c2d-8ef4-68c10f6df08f'
          : '580fa012-0310-4d02-8fd9-7cff7811dc7b';

        const htmlData = `<div>
        🚨 큐잉 Error Alert  <strong> 
          Occured at->  
         <br/>
      [${method} ${originalUrl} ${statusCode} - ${userAgent} ${ip}]
        </strong></div>`;

        this.swMaintainerService
          .getMaintainerBySwTypeId(isAdminSwTypeId)
          .then((maintainers) => {
            for (const maintainer of maintainers) {
              this.mQue.add(E_SendToQue.teams, {
                user: maintainer.user,
                htmlMsg: htmlData,
              });
            }
          });
      }
    });

    next();
  }
}
