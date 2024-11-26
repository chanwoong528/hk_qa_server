import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { SwType } from './sw-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSwTypeDto, UpdateSwTypeDto } from './sw-type.dto';
import { UserRepository } from 'src/user/user.repository';
import { E_Role } from 'src/enum';

@Injectable()
export class SwTypeService {
  constructor(
    @InjectRepository(SwType)
    private readonly swTypeRepository: Repository<SwType>,
    private readonly userRepository: UserRepository,
  ) {}

  //CREATE
  async createSwType(swType: CreateSwTypeDto, userId: string): Promise<SwType> {
    const author = await this.userRepository.findOneByUUID(userId);
    if (!author) {
      throw new NotFoundException('User not found');
    }
    let createdSwType = new SwType(swType);
    createdSwType.user = author;

    return await this.swTypeRepository.save(createdSwType);
  }

  //GET_ALL
  async getSwTypes(userId?: string): Promise<SwType[]> {
    const loggedInUser = await this.userRepository.findOneByUUID(userId);

    if (loggedInUser.role === E_Role.tester) {
      return await this.swTypeRepository.find({
        relations: [
          'user',
          'swVersions',
          'swVersions.testSessions',
          'swMaintainers',
        ],
        where: { showStatus: 'Y', swMaintainers: { user: { id: userId } } },
      });
    }

    return await this.swTypeRepository.find({
      relations: [
        'user',
        'swVersions',
        'swVersions.testSessions',
        'jenkinsDeployments',
      ],
      where: { showStatus: 'Y' },
      order: {
        createdAt: 'DESC',
        swVersions: {
          createdAt: 'DESC',
        },
      },
    });
  }

  async getSwTypeById(id: string): Promise<SwType> {
    if (!id) throw new NotFoundException('Software Type not found');

    return await this.swTypeRepository.findOne({
      where: { swTypeId: id },
    });
  }

  //UPDATE
  async updateSwTypeById(
    id: string,
    swType: UpdateSwTypeDto,
  ): Promise<UpdateResult> {
    const updatedResult = await this.swTypeRepository.update(id, swType);

    if (updatedResult.affected === 0) {
      throw new NotFoundException('User does not exist!');
    }
    return updatedResult;
  }
}
