import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/user/user.entity';
import { SwVersion } from 'src/sw-version/sw-version.entity';

@Entity({ name: 'comment', schema: 'public', synchronize: true })
export class Comment {

  constructor(partial: Partial<Comment>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  commentId: string;

  @Column()
  content: string;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @ManyToOne((type) => Comment, (comment) => comment.childComments, { nullable: true })
  parentComment?: Comment;

  @OneToMany((type) => Comment, (comment) => comment.parentComment, { cascade: true })
  childComments?: Comment[];

  @ManyToOne((type) => User, (user) => user)
  user: User;

  @ManyToOne((type) => SwVersion, (swVersion) => swVersion)
  swVersion: SwVersion;


}
