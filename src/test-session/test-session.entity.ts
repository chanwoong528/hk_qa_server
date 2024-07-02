import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';
import { E_TestStatus } from 'src/enum';

@Entity({ name: 'testSession', schema: 'public', synchronize: true })
@Unique(['swVersion', 'user'])
export class TestSession {
  constructor(partial?: Partial<TestSession>) {
    if (!!partial) {
      Object.assign(this, partial);
    }

  }

  @PrimaryGeneratedColumn('uuid')
  sessionId: string;

  @Column({ default: E_TestStatus.pending, type: 'enum', enum: E_TestStatus })
  status: E_TestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  finishedAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @ManyToOne(() => SwVersion, (swVersion) => swVersion)
  swVersion: SwVersion;
}
