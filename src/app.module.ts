import { Global, Module } from '@nestjs/common';
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

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `env/${process.env.NODE_ENV}.env`,
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
        logging: true,
        timezone: 'local',
        // ssl: true
        ssl: configService.get('NODE_ENV') === 'prod' ? true : false
      }),
    }),
    AuthModule,
    UsersModule,
    SwTypeModule,
    CommentModule,

    SwTypeModule,
    SwVersionModule,
    TestSessionModule,
    MailModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
