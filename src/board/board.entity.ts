import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/user/user.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';
import { Reaction } from 'src/reaction/reaction.entity';
import { SwType } from 'src/sw-type/sw-type.entity';

@Entity({ name: 'board', schema: 'public', synchronize: true })
export class Board {
  constructor(partial: Partial<Board>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  boardId: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  boardType: string; // 'update' | 'req'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne((type) => User, (user) => user)
  user: User;

  @ManyToOne((type) => SwType, (swType) => swType)
  swType: SwType;
}
