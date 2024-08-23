import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { SwType } from 'src/sw-type/sw-type.entity';
import { TestSession } from 'src/test-session/test-session.entity';
import { TestUnit } from 'src/test-unit/test-unit.entity';

@Entity({ name: 'swVersion', schema: 'public', synchronize: true })
@Unique(['versionTitle', 'swType'])
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

  @Column({ nullable: true })
  fileSrc: string;

  @Column()
  tag: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  dueDate: string;

  @ManyToOne((type) => User, (user) => user)
  user: User;

  @ManyToOne((type) => SwType, (swType) => swType)
  @JoinColumn()
  swType: SwType;

  @OneToMany((type) => TestSession, (testSession) => testSession.swVersion)
  @JoinColumn()
  testSessions: TestSession[];

  @OneToMany((type) => TestUnit, (testUnit) => testUnit.swVersion)
  @JoinColumn()
  testUnits: TestUnit[];
}
