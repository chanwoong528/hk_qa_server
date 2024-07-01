import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/user.entity';
import { AuthModule } from './auth/auth.module';

import { CommentModule } from './comment/comment.module';
import { SwTypeModule } from './sw-type/sw-type.module';
import { UsersModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    UsersModule,
    SwTypeModule,

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
        entities: [
          User,

        ],
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
        timezone: 'local',
      }),
    }),

    AuthModule,

    CommentModule,

    SwTypeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
