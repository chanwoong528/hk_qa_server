import { Global, Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

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
import { EventsModule } from './events/events.module';
import { SseController } from './sse/sse.controller';
import { SseService } from './sse/sse.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SseModule } from './sse/sse.module';

@Global()
@Module({
  imports: [
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
        logging: false,
        timezone: 'local',
        ssl: configService.get('NODE_ENV') === 'prod' ?
          {
            rejectUnauthorized: false,
          } : false,
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
    EventsModule,
    SseModule,


  ],
  controllers: [AppController],
  providers: [

    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    Logger,
  ],
})
export class AppModule { }
