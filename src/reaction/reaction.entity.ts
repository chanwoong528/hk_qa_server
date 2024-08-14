import { E_ReactionParentType, E_ReactionType } from 'src/enum';
import { TestUnit } from 'src/test-unit/test-unit.entity';
import { User } from 'src/user/user.entity';
import { Comment } from 'src/comment/comment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'reaction', schema: 'public', synchronize: true })
@Unique([
  'user.id',
  'parentComment.commentId',
  'parentTestUnit.testUnitId',
  'parentType',
])
export class Reaction {
  constructor(partial: Partial<Reaction>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    default: E_ReactionParentType.testUnit,
    type: 'enum',
    enum: E_ReactionParentType,
  })
  parentType: E_ReactionParentType;

  @Column({})
  reactionType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne((type) => User, (user) => user)
  user: User;

  @ManyToOne((type) => Comment, (comment) => comment, {
    nullable: true,
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  parentComment?: Comment;

  @ManyToOne((type) => TestUnit, (testUnit) => testUnit, {
    nullable: true,
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  parentTestUnit?: TestUnit;

  // @ManyToOne((type) => SwVersion, (swVersion) => swVersion)
  // swVersion: SwVersion;
}
