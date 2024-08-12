import { E_LogType } from 'src/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';




@Entity({ name: 'QAlog', schema: 'public', synchronize: true })
export class QAlog {
  constructor(partial: Partial<QAlog>) {
    Object.assign(this, partial);
  }


  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: E_LogType.testerStatus, type: 'enum', enum: E_LogType })
  logType: E_LogType;

  @Column('jsonb')
  content: any;

  @CreateDateColumn()
  createdAt: Date;


  // @ManyToOne((type) => Comment, (comment) => comment.childComments, { nullable: true })
  // parentComment?: Comment;

  // @OneToMany((type) => Comment, (comment) => comment.parentComment, { cascade: true })
  // childComments?: Comment[];

  // @ManyToOne((type) => User, (user) => user)
  // user: User;

  // @ManyToOne((type) => SwVersion, (swVersion) => swVersion)
  // swVersion: SwVersion;


}
