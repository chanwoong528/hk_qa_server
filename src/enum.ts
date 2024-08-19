export enum E_Role {
  tester = 'tester',
  admin = 'admin',
  master = 'master',
}
export enum E_UserStatus {
  ok = 'ok',
  pending = 'pending',
  blocked = 'blocked',
}


export enum E_SendToQue {
  email = "email",
  teams = "teams",
}
export enum E_SendType {
  verification = 'verification',
  forgotPassword = 'forgotPassword',
  testerAdded = 'testerAdded',
  testFinished = 'testFinished',
}

export enum E_TestStatus {
  pending = 'pending',
  passed = 'passed',
  failed = 'failed',
}

export enum E_LogType {
  testerStatus = 'testerStatus',
}

export enum E_ReactionParentType {
  comment = 'comment',
  testUnit = 'testUnit',
}
export enum E_ReactionType {
  check = 'check',
  stop = 'stop',

  like = 'like',
  dislike = 'dislike',
  love = 'love',
  sad = 'sad',
  wow = 'wow',
}