import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SwTypeService } from './sw-type.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { E_Role } from 'src/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CreateSwTypeDto, UpdateSwTypeDto } from './sw-type.dto';
import { SwType } from './sw-type.entity';
import { UpdateResult } from 'typeorm';

@Controller('sw-type')
export class SwTypeController {
  constructor(private readonly swTypeService: SwTypeService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getSwTypes(@Request() req): Promise<SwType[]> {
    const { sub } = req.user;

    return await this.swTypeService.getSwTypes(sub);
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

  @Patch(':id')
  @Roles(E_Role.master)
  @UseGuards(AuthGuard)
  async updateSwType(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() swType: UpdateSwTypeDto,
  ): Promise<UpdateResult> {
    return await this.swTypeService.updateSwTypeById(id, swType);
  }
}
