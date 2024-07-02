import { Module } from '@nestjs/common';
import { SwVersionController } from './sw-version.controller';
import { SwVersionService } from './sw-version.service';
import { UserRepository } from 'src/user/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwVersion } from './sw-version.entity';
import { JwtModule } from '@nestjs/jwt';
import { SwTypeModule } from 'src/sw-type/sw-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([SwVersion]), JwtModule, SwTypeModule],
  controllers: [SwVersionController],
  providers: [SwVersionService, UserRepository],
  exports: [SwVersionService]
})

export class SwVersionModule { }
