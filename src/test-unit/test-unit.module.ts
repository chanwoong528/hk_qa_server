import { Module } from '@nestjs/common';
import { TestUnitController } from './test-unit.controller';
import { TestUnitService } from './test-unit.service';
import { TestUnit } from './test-unit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SwVersionModule } from 'src/sw-version/sw-version.module';

@Module({
  imports: [TypeOrmModule.forFeature([TestUnit]), SwVersionModule],
  controllers: [TestUnitController],
  providers: [TestUnitService],
  exports: [TestUnitService]
})
export class TestUnitModule { }
