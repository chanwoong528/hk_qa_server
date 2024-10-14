export class CreateSwVersionDto {
  swTypeId: string;
  versionTitle: string;
  versionDesc: string;
  fileSrc?: string;
  tag: string;
}

export class UpdateSwVersionDto {
  versionTitle?: string;
  versionDesc?: string;
  fileSrc?: string;
  tag?: string;
}
