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
import { User } from 'src/user/user.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';
import { SwMaintainer } from 'src/sw-maintainer/sw-maintainer.entity';

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

  @Column({ default: 'Y' })
  showStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne((type) => User, (user) => user)
  user: User;

  @OneToMany((type) => SwVersion, (swVersion) => swVersion.swType)
  @JoinColumn()
  swVersions: SwVersion[];

  @OneToMany((type) => SwMaintainer, (swMaintainer) => swMaintainer.swType)
  @JoinColumn()
  swMaintainers: SwMaintainer[];
}
