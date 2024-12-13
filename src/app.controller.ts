import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log('getHello');
    return this.appService.getHello();
  }

  @Get('api/health')
  getHealth(): string {
    return 'OK';
  }

  @Get('crash')
  getCrash(): string {
    throw new Error('Crash!');
  }
}
