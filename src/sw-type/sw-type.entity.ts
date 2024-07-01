import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity({ name: 'swType', schema: 'public', synchronize: true })
export class SwType {
  constructor(partial: Partial<SwType>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  swTypeId: string;

  @Column()
  typeTitle: string;

  @Column()
  typeDesc: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne((type) => User, (user) => user)
  user: User;
}
