import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JenkinsDeploymentService } from './jenkins-deployment.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { JenkinsDeployment } from './jenkins-deployment.entity';

@Controller('jenkins-deployment')
export class JenkinsDeploymentController {
  constructor(
    private readonly jenkinsDeploymentService: JenkinsDeploymentService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async createJenkinsDeployment(
    @Body() jenkinsDeploymentDto: Partial<JenkinsDeployment>,
  ): Promise<any> {
    return await this.jenkinsDeploymentService.createJenkinsDeployment(
      jenkinsDeploymentDto,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateJenkinsDeployment(
    @Param('id') id: string,
    @Body() jenkinsDeploymentDto: Partial<JenkinsDeployment>,
  ): Promise<any> {
    return await this.jenkinsDeploymentService.updateJenkinsDeployment(
      id,
      jenkinsDeploymentDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteJenkinsDeployment(@Param('id') id: string): Promise<any> {
    return await this.jenkinsDeploymentService.deleteJenkinsDeployment(id);
  }
}
