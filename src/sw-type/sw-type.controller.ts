import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { SwTypeService } from './sw-type.service';
import { Roles } from 'src/decorator/roles.decorator';
import { E_Role } from 'src/enum';
import { AuthGuard } from 'src/guard/auth.guard';
import { CreateSwTypeDto } from './sw-type.dto';
import { SwType } from './sw-type.entity';

@Controller('sw-type')
export class SwTypeController {
  constructor(private readonly swTypeService: SwTypeService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getSwTypes(): Promise<SwType[]> {
    return await this.swTypeService.getSwTypes();
  }

  @Post()
  @Roles(E_Role.master)
  @UseGuards(AuthGuard)
  async createSw(
    @Body() swType: CreateSwTypeDto,
    @Request() req,
  ): Promise<SwType> {
    const { sub } = req.user;
    return await this.swTypeService.createSwType(swType, sub);
  }
}
