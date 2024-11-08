import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { DeployLogService } from './deploy-log.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { E_Role } from 'src/enum';

@Controller('deploy-log')
export class DeployLogController {
  constructor(private readonly deployLogService: DeployLogService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createDeployLog(jenkinsDeployId: string, @Request() req): Promise<any> {
    const { sub } = req.user;

    return await this.deployLogService.createDeployLog(jenkinsDeployId, sub);
  }
}
