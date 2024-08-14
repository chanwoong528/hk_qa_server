import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,

  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';
import { Reaction } from 'src/reaction/reaction.entity';

@Entity({ name: 'testUnit', schema: 'public', synchronize: true })
export class TestUnit {
  constructor(partial?: Partial<TestUnit>) {
    if (!!partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  testUnitId: string;

  @Column()
  unitDesc: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user, { eager: true })
  @JoinColumn()
  user: User

  @ManyToOne(() => SwVersion, (swVersion) => swVersion, { eager: true, cascade: true, })
  @JoinTable()
  swVersion: SwVersion;

  @OneToMany((type) => Reaction, (reaction) => reaction.parentTestUnit,
    // { cascade: ["remove"] }
  )
  @JoinTable()
  reactions: Reaction[];

}
