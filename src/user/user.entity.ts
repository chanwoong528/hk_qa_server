import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { SwType } from '../sw-type/sw-type.entity';
import { E_Role } from 'src/enum';

@Entity({ name: 'users', schema: 'public', synchronize: true })
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: E_Role.tester, type: 'enum', enum: E_Role })
  role: E_Role;

  @Column({ select: false })
  pw: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany((type) => SwType, (swType) => swType.user)
  swTypes: SwType[];
}
