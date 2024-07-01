import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { DataSource, QueryFailedError, Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserDto } from "./user.dto";


@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager())
  }

  async findOneByUUID(id: string): Promise<User> {
    return await this.findOneBy({ id });
  }

  async createUser(user: CreateUserDto): Promise<void> {
    try {
      await this.save(user);

    } catch (error) {
      if (error instanceof QueryFailedError) {
        switch (error.driverError.code) {
          case '23505':
            throw new ConflictException('email already exists');
        }
      }

      throw new InternalServerErrorException();
    }


  }
}