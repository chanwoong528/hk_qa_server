import { Global, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './user/user.entity';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { SwTypeModule } from './sw-type/sw-type.module';
import { UsersModule } from './user/user.module';
import { SwVersionModule } from './sw-version/sw-version.module';
import { TestSessionModule } from './test-session/test-session.module';

import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guard/role.guard';
import { MailModule } from './mail/mail.module';
import { UploadsModule } from './uploads/uploads.module';
import { LogModule } from './log/log.module';
import { TestUnitModule } from './test-unit/test-unit.module';
import { ReactionModule } from './reaction/reaction.module';
import { SseModule } from './sse/sse.module';
import { AppConsumer } from './app.consumer';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

// import { EventsModule } from './events/events.module';//socket
import { SwMaintainerModule } from './sw-maintainer/sw-maintainer.module';
import { BoardModule } from './board/board.module';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter, // Or FastifyAdapter from `@bull-board/fastify`
    }),

    BullModule.registerQueue({
      name: 'queue',
    }),
    BullBoardModule.forFeature({
      name: 'queue',
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),

    EventEmitterModule.forRoot(),

    ConfigModule.forRoot({
      envFilePath: `env/${process.env.NODE_ENV}.env`,
      // envFilePath: `env/prod.env`,
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        retryAttempts: configService.get('NODE_ENV') === 'prod' ? 10 : 1,
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: Number(configService.get('POSTGRES_PORT_POOL')),
        database: configService.get('POSTGRES_DB'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        entities: [User],
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'prod' ? false : false,
        timezone: 'local',
        ssl:
          configService.get('NODE_ENV') === 'prod'
            ? {
                rejectUnauthorized: false,
              }
            : false,
      }),
    }),
    AuthModule,
    UsersModule,
    SwTypeModule,
    CommentModule,
    SwTypeModule,
    SwVersionModule,
    TestSessionModule,
    UploadsModule,
    TestUnitModule,
    ReactionModule,

    LogModule,
    MailModule,
    SseModule,
    SwMaintainerModule,
    BoardModule,
    // EventsModule, //for socket
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    Logger,
    AppConsumer,
  ],
  exports: [BullModule],
})
export class AppModule {}
