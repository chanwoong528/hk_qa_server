import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { DeployLogService } from './deploy-log.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { E_Role } from 'src/enum';

@Controller('deploy-log')
export class DeployLogController {
  constructor(private readonly deployLogService: DeployLogService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createDeployLog(
    @Request() req,
    @Body()
    deployLogParam: {
      tag: string;
      jenkinsDeploymentId: string;
      reason: string;
    },
  ): Promise<any> {
    const { sub } = req.user;

    const { tag, jenkinsDeploymentId, reason } = deployLogParam;

    return await this.deployLogService.createDeployLog(
      { jenkinsDeploymentId, tag, reason },
      sub,
    );
    return;
  }
}
