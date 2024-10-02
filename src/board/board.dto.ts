export class CreateBoardDto {
  title: string;
  content: string;
  userId: string;
  swTypeId: string;

  boardType: 'req' | 'update';
}

export class UpdateBoardDto {
  userId: string;
  title?: string;
  content?: string;
}
