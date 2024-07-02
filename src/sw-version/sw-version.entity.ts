import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { SwType } from 'src/sw-type/sw-type.entity';

@Entity({ name: 'swVersion', schema: 'public', synchronize: true })
@Unique(['versionTitle'])
export class SwVersion {
  constructor(partial?: Partial<SwVersion>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  swVersionId: string;

  @Column()
  versionTitle: string;

  @Column()
  versionDesc: string;

  @Column({ nullable: true, })
  fileSrc: string;

  @Column()
  tag: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @ManyToOne((type) => User, (user) => user)
  user: User;

  @ManyToOne((type) => SwType, (swType) => swType)
  swType: SwType;
}
