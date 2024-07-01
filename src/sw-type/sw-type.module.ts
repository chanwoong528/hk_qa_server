import { Module } from '@nestjs/common';
import { SwTypeController } from './sw-type.controller';
import { SwTypeService } from './sw-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwType } from './sw-type.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SwType]), JwtModule],
  controllers: [SwTypeController],
  providers: [SwTypeService, UserRepository],
})
export class SwTypeModule {}
