import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/HttpExceptionFilter';
// import { IoAdapter } from '@nestjs/platform-socket.io';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    // new ValidationPipe({ whitelist: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter())

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    exposedHeaders: ['Authorization'], // * 사용
  })

  // app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(3000);

}
bootstrap();
