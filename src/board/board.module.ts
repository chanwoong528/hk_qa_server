import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './board.entity';
import { JwtModule } from '@nestjs/jwt';
import { SwTypeModule } from 'src/sw-type/sw-type.module';
import { UserRepository } from 'src/user/user.repository';
import { UploadsService } from 'src/uploads/uploads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board]), JwtModule, SwTypeModule],
  controllers: [BoardController],
  providers: [BoardService, UserRepository, UploadsService],
  exports: [BoardService],
})
export class BoardModule {}
