import { SwTypeService } from 'src/sw-type/sw-type.service';
import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SwMaintainer } from './sw-maintainer.entity';
import { In, QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { PutMaintainerListDto } from './sw-maintainer.dto';

@Injectable()
export class SwMaintainerService {
  constructor(
    @InjectRepository(SwMaintainer)
    private readonly swMaintainerRepository: Repository<SwMaintainer>,
    private readonly userRepository: UserRepository,
    private readonly SwTypeService: SwTypeService,
  ) {}

  async getMaintainerBySwTypeId(swTypeId: string): Promise<SwMaintainer[]> {
    return this.swMaintainerRepository.find({
      relations: ['user'],
      where: { swType: { swTypeId: swTypeId } },
    });
  }

  async deleteOrAddMaintainer(
    swTypeId: string,
    maintainDto: PutMaintainerListDto,
  ) {
    try {
      const targetSwType = await this.SwTypeService.getSwTypeById(swTypeId);
      const promiseArr = [];

      if (maintainDto.tobeDeletedArr) {
        const deletePromise = await this.swMaintainerRepository.delete({
          swType: { swTypeId: targetSwType.swTypeId },
          user: { id: In(maintainDto.tobeDeletedArr) },
        });
        promiseArr.push(deletePromise);
      }

      if (maintainDto.tobeAddedArr) {
        const addPromise = maintainDto.tobeAddedArr.map(async (userId) => {
          const newMaintainer = await this.userRepository.findOneByUUID(userId);

          let createdMaintainer = new SwMaintainer();
          createdMaintainer.user = newMaintainer;
          createdMaintainer.swType = targetSwType;
          const addedMaintainer =
            await this.swMaintainerRepository.save(createdMaintainer);
          return addedMaintainer;
        });
        promiseArr.push(Promise.all(addPromise));
      }

      const result = await Promise.all(promiseArr);

      return result;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        switch (error.driverError.code) {
          case '23505':
            throw new ConflictException(
              'Maintainer already Assign to same user',
            );
          case '22P02':
            throw new UnprocessableEntityException(
              `Invalid input: ${error.message}`,
            );
        }
      }
      throw error;
    }
  }
}
