export class JenkinsDeploymentDto {
  jenkinsUrl: string;
  title: string;
  description: string;
  swTypeId: string;
}
export class UpdateJenkinsDeploymentDto extends JenkinsDeploymentDto {
  jenkinsDeploymentId: string;
}
