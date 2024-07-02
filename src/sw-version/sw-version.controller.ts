import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards, Request, Patch, NotFoundException, } from '@nestjs/common';
import { SwVersionService } from './sw-version.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { SwVersion } from './sw-version.entity';
import { CreateSwVersionDto, UpdateSwVersionDto } from './sw-version.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { E_Role } from 'src/enum';
import { UpdateResult } from 'typeorm';

@Controller('sw-version')
export class SwVersionController {

  constructor(private readonly swVersionService: SwVersionService) { }

  // @UseGuards(AuthGuard)
  @Get(':id')
  async getSwVersions(@Param('id', new ParseUUIDPipe()) swTypeid: string): Promise<SwVersion[]> {
    return await this.swVersionService.getSwVersions(swTypeid)
  }

  @Roles(E_Role.master, E_Role.admin)
  @UseGuards(AuthGuard)
  @Post()
  async createSwVersion(@Body() createVersionDto: CreateSwVersionDto, @Request() req,): Promise<SwVersion> {
    const { sub } = req.user;
    return await this.swVersionService.createSwVersion(createVersionDto, sub);
  }


  @Roles(E_Role.master, E_Role.admin)
  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateSwVersion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() swVersion: UpdateSwVersionDto
  ): Promise<UpdateResult> {

    const updatedResult = await this.swVersionService.updateSwVersionById(id, swVersion);
    if (updatedResult.affected === 0) {
      throw new NotFoundException('SwVersion does not exist!');
    }

    return updatedResult
  }
}
