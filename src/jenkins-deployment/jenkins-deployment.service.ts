import { Injectable, NotFoundException } from '@nestjs/common';
import { JenkinsDeployment } from './jenkins-deployment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SwTypeService } from 'src/sw-type/sw-type.service';
import { UpdateJenkinsDeploymentDto } from './jenkins-deployment.dto';

@Injectable()
export class JenkinsDeploymentService {
  constructor(
    @InjectRepository(JenkinsDeployment)
    private readonly jenkinsDeploymentRepository: Repository<JenkinsDeployment>,
    private readonly swTypeService: SwTypeService,
  ) {}

  async getJenkinsDeploymentById(id: string): Promise<JenkinsDeployment> {
    return await this.jenkinsDeploymentRepository.findOne({
      relations: ['swType'],
      where: {
        jenkinsDeploymentId: id,
      },
    });
  }

  async getJenkinsDeploymentBySwTypeId(
    swTypeId: string,
  ): Promise<JenkinsDeployment[]> {
    return await this.jenkinsDeploymentRepository.find({
      relations: ['swType', 'deployLogs'],
      where: {
        swType: { swTypeId },
      },
    });
  }

  async createJenkinsDeployment(
    jenkinsDeploymentDto: Partial<JenkinsDeployment & { swTypeId: string }>,
  ): Promise<any> {
    const targetSwType = await this.swTypeService.getSwTypeById(
      jenkinsDeploymentDto.swTypeId,
    );

    if (!targetSwType) {
      throw new NotFoundException('SW Type not found');
    }
    const newJenkinsDeployment = new JenkinsDeployment(jenkinsDeploymentDto);
    newJenkinsDeployment.swType = targetSwType;

    return await this.jenkinsDeploymentRepository.save(newJenkinsDeployment);
  }

  async updateJenkinsDeployment(
    id: string,
    jenkinsDeploymentDto: Partial<UpdateJenkinsDeploymentDto>,
  ): Promise<any> {
    const targetJenkinsDeployment =
      await this.jenkinsDeploymentRepository.findOne({
        relations: ['swType'],
        where: {
          jenkinsDeploymentId: id,
        },
      });

    if (!targetJenkinsDeployment) {
      throw new NotFoundException('Jenkins Deployment not found');
    }

    const updatedTargetJenkinsDeployment = new JenkinsDeployment(
      targetJenkinsDeployment,
    );

    Object.assign(updatedTargetJenkinsDeployment, jenkinsDeploymentDto);

    return await this.jenkinsDeploymentRepository.save(
      updatedTargetJenkinsDeployment,
    );
  }

  async deleteJenkinsDeployment(id: string): Promise<any> {
    return await this.jenkinsDeploymentRepository.delete(id);
  }
}
