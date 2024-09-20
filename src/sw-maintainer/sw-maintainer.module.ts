import { Module } from '@nestjs/common';
import { SwMaintainerController } from './sw-maintainer.controller';
import { SwMaintainerService } from './sw-maintainer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwMaintainer } from './sw-maintainer.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from 'src/user/user.repository';
import { SwTypeModule } from 'src/sw-type/sw-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([SwMaintainer]), JwtModule, SwTypeModule],
  controllers: [SwMaintainerController],
  providers: [SwMaintainerService, UserRepository],
  exports: [SwMaintainerService],
})
export class SwMaintainerModule {}
