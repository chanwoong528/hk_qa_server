import { Module } from '@nestjs/common';
import { SwTypeController } from './sw-type.controller';
import { SwTypeService } from './sw-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwType } from './sw-type.entity';



@Module({
  imports: [TypeOrmModule.forFeature([SwType])],
  controllers: [SwTypeController],
  providers: [SwTypeService]
})
export class SwTypeModule { }
