import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, EntityManager, QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  getCols<T>(repository: Repository<T>): (keyof T)[] {
    return (repository.metadata.columns.map(col => col.propertyName) as (keyof T)[]);
  }
  async findOneByUUID(id: string): Promise<User> {


    return await this.findOne({ where: { id }, select: this.getCols(this) });
  }

  async createUser(user: CreateUserDto): Promise<User> {
    try {
      return await this.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        switch (error.driverError.code) {
          case '23505':
            throw new ConflictException('email already exists');
          case '22P02':
            throw new UnprocessableEntityException(
              `Invalid input: ${error.message}`,
            );
        }
      }

      throw new InternalServerErrorException();
    }
  }
}
