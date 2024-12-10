import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';

const env = process.env.NODE_ENV || 'development';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  //   private logger = new Logger('HTTP');
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
    });

    next();
  }
}