import { SwType } from 'src/sw-type/sw-type.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'swMaintainer', schema: 'public', synchronize: true })
export class SwMaintainer {
  constructor(partial?: Partial<SwMaintainer>) {
    if (!!partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  swMaintainerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne((type) => User, (user) => user)
  @JoinColumn()
  user: User;

  @ManyToOne((type) => SwType, (swType) => swType)
  @JoinColumn()
  swType: SwType;
}
