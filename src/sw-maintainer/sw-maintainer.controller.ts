import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { SwMaintainerService } from './sw-maintainer.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { PutMaintainerListDto } from './sw-maintainer.dto';

@Controller('sw-maintainer')
export class SwMaintainerController {
  constructor(private readonly swMaintainerService: SwMaintainerService) {}

  @Get(':swTypeId')
  async getSwMaintainers(@Param('swTypeId') swTypeId: string): Promise<any> {
    return await this.swMaintainerService.getMaintainerBySwTypeId(swTypeId);
  }

  @Put(':swTypeId')
  @UseGuards(AuthGuard)
  async deleteOrAddTestSession(
    @Param('swTypeId') swTypeId: string,
    @Body() maintainDto: PutMaintainerListDto,
  ): Promise<any> {
    return await this.swMaintainerService.deleteOrAddMaintainer(
      swTypeId,
      maintainDto,
    );
  }
}
