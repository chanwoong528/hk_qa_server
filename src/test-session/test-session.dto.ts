import { IsUUID } from "class-validator";
import { E_TestStatus } from "src/enum";

export class CreateTestSessionDto {
  // @IsUUID()
  userId: string;

  // @IsUUID()
  swVersionId: string;
}


export class UpdateTestSessionDto {
  status: E_TestStatus;
}
export class PutTestSessionListDto {
  tobeDeletedArr?: string[]
  tobeAddedArr?: string[]
}