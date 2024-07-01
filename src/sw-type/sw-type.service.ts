import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SwType } from './sw-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSwTypeDto } from './sw-type.dto';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class SwTypeService {
  constructor(
    @InjectRepository(SwType)
    private readonly swTypeRepository: Repository<SwType>,
    private readonly userRepository: UserRepository,
  ) {}

  async createSwType(swType: CreateSwTypeDto, userId: string): Promise<SwType> {
    const author = await this.userRepository.findOneByUUID(userId);
    if (!author) {
      throw new Error('User not found');
    }
    let createdSwType = new SwType(swType);
    createdSwType.user = author;

    return await this.swTypeRepository.save(createdSwType);
  }

  async getSwTypes(): Promise<SwType[]> {
    return await this.swTypeRepository.find({ relations: ['user'] });
  }
}
