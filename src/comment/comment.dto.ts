export class CreateCommentDto {
  // commentId:string
  content: string;
  swVersionId: string;
  userId: string;
  parentId?: string;
}


// export class UpdateCommentDto {
//   versionTitle?: string;
//   versionDesc?: string;
//   fileSrc?: string;
//   tag?: string;
// }
