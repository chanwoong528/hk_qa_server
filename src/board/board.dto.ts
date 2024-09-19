export class CreateBaordDto {
  title: string;
  content: string;
  userId: string;
  swTypeId: string;

  boardType: 'req' | 'update';
}
