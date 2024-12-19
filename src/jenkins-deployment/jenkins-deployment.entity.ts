import { DeployLog } from 'src/deploy-log/deploy-log.entity';
import { SwType } from 'src/sw-type/sw-type.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'jenkinsDeployment', schema: 'public', synchronize: true })
export class JenkinsDeployment {
  constructor(partial?: Partial<JenkinsDeployment>) {
    if (!!partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  jenkinsDeploymentId: string;

  @Column()
  jenkinsUrl: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => SwType, (swType) => swType)
  @JoinColumn()
  swType: SwType;

  @OneToMany(() => DeployLog, (deployLog) => deployLog.jenkinsDeployment, {
    // eager: true,
    // cascade: true,
    // onDelete: 'CASCADE',
  })
  @JoinColumn()
  deployLogs: DeployLog[];
}
