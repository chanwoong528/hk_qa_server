import { JenkinsDeployment } from 'src/jenkins-deployment/jenkins-deployment.entity';
import { User } from 'src/user/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'deployLog', schema: 'public', synchronize: true })
export class DeployLog {
  @PrimaryGeneratedColumn('uuid')
  deployLogId: string;

  @ManyToOne(() => JenkinsDeployment, (jenkinsDeployment) => jenkinsDeployment)
  @JoinColumn()
  jenkinsDeployment: JenkinsDeployment;

  @OneToOne(() => User, (user) => user)
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
