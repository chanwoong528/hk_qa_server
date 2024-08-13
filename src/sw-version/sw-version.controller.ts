import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards, Request, Patch, NotFoundException, UseInterceptors, UploadedFile, } from '@nestjs/common';
import { SwVersionService } from './sw-version.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { SwVersion } from './sw-version.entity';
import { CreateSwVersionDto, UpdateSwVersionDto } from './sw-version.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { E_Role } from 'src/enum';
import { UpdateResult } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from 'src/uploads/uploads.service';

@Controller('sw-version')
export class SwVersionController {

  constructor(
    private readonly swVersionService: SwVersionService,
    private readonly uploadsService: UploadsService
  ) { }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getSwVersions(@Param('id', new ParseUUIDPipe()) swTypeid: string): Promise<SwVersion[]> {
    return await this.swVersionService.getSwVersions(swTypeid)
  }

  @Roles(E_Role.master, E_Role.admin)
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async createSwVersion(
    @Body() createVersionDto: CreateSwVersionDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ): Promise<SwVersion> {
    const { sub } = req.user;
    if (!!file) {
      const uploadedInfo = await this.uploadsService.uploadFileSwVersion(file);
      createVersionDto.fileSrc = uploadedInfo;
    }
    return await this.swVersionService.createSwVersion(createVersionDto, sub);
  }

  @Roles(E_Role.master, E_Role.admin)
  @UseGuards(AuthGuard)
  @Post('edit/:id')
  @UseInterceptors(FileInterceptor("file"))
  async updateSwVersion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() swVersion: UpdateSwVersionDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UpdateResult> {
    console.log("@@@@@ ", swVersion)
    if (!!file) {
      const uploadedInfo = await this.uploadsService.uploadFileSwVersion(file);
      swVersion.fileSrc = uploadedInfo;
    }
    const updatedResult = await this.swVersionService.updateSwVersionById(id, swVersion);
    if (updatedResult.affected === 0) {
      throw new NotFoundException('SwVersion does not exist!');
    }

    return updatedResult
  }
}
