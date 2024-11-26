import { E_DeployStatus } from 'src/enum';
import { JenkinsDeployment } from 'src/jenkins-deployment/jenkins-deployment.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'deployLog', schema: 'public', synchronize: true })
export class DeployLog {
  @PrimaryGeneratedColumn('uuid')
  deployLogId: string;

  @Column()
  buildNumber: number;

  @Column()
  tag: string;

  @Column({
    default: E_DeployStatus.pending,
    type: 'enum',
    enum: E_DeployStatus,
  })
  status: E_DeployStatus;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => JenkinsDeployment, (jenkinsDeployment) => jenkinsDeployment)
  @JoinColumn()
  jenkinsDeployment: JenkinsDeployment;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn()
  user: User;
}
