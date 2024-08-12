import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
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
@Unique(['swVersion', 'user.id'])
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

  @Column({ nullable: true, default: null })
  reasonContent: string;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  finishedAt: Date;

  @ManyToOne(() => User, user => user, { eager: true })
  @JoinColumn()
  user: User

  @ManyToOne(() => SwVersion, (swVersion) => swVersion, { eager: true, cascade: true, })
  @JoinTable()
  swVersion: SwVersion;
}
