import { Module } from '@nestjs/common';
import { TestSessionController } from './test-session.controller';
import { TestSessionService } from './test-session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSession } from './test-session.entity';
import { JwtModule } from '@nestjs/jwt';
import { SwVersionModule } from 'src/sw-version/sw-version.module';
import { UserRepository } from 'src/user/user.repository';
import { MailService } from 'src/mail/mail.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { LogModule } from 'src/log/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestSession]),
    JwtModule,
    SwVersionModule,
    LogModule
  ],
  controllers: [TestSessionController],
  providers: [TestSessionService, UserRepository, MailService, UploadsService]
})
export class TestSessionModule { }
