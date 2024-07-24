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
import { E_Role, E_UserStatus } from 'src/enum';

@Entity({ name: 'users', schema: 'public', synchronize: true })
@Unique(['email'])
export class User {

  constructor(partial?: Partial<User>) {
    if (!!partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: E_Role.tester, type: 'enum', enum: E_Role })
  role: E_Role;

  @Column({ default: "123456", select: false })
  pw: string;

  @Column({ default: E_UserStatus.pending, type: 'enum', enum: E_UserStatus })
  userStatus: E_UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @OneToMany((type) => SwType, (swType) => swType.user)
  swTypes: SwType[];


}
