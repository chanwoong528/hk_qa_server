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
  email = 'email',
  teams = 'teams',
}
export enum E_SendType {
  verification = 'verification',
  forgotPassword = 'forgotPassword',
  testerAdded = 'testerAdded',
  testFinished = 'testFinished',
  inquery = 'inquery',
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

export enum E_DeployStatus {
  pending = 'pending', //-> jenkins post sent, but not yet finished
  /**
   * "building": true,
   * "inProgress": true,
   * "result": null,
   */

  success = 'success',
  /**
   * "building": false,
   * "inProgress": false,
   * "result": "SUCCESS"
   */
  failed = 'failed',
  /**
   * "building": false,
   * "inProgress": false,
   * "result": "FAILURE"
   */
  aborted = 'aborted',
  /**
   * "building": false,
   * "inProgress": false,
   * "result": "ABORTED"
   */
}

export enum E_JenkinsUrlType {
  POST_build = '/build',
  POST_buildWithParam = '/buildWithParam',
  GET_lastBuild = '/lastBuild/api/json',
  GET_buildList = '/api/json',
  GET_nextBuildNumber = '/api/json?tree=nextBuildNumber',
}
