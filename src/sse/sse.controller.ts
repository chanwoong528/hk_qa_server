import { Controller, Param, ParseUUIDPipe, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SseService } from './sse.service';
import { fromEvent, map } from 'rxjs';

@Controller('sse')
export class SseController {
  constructor(
    private readonly sseService: SseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Sse('post-comment/:swVersionId')
  sendClientAlarm(@Param('swVersionId', ParseUUIDPipe) swVersionId: string) {
    return fromEvent(this.eventEmitter, 'new-comment').pipe(
      map((_) => ({ data: { type: 'new-comment' } })),
    );
  }

  @Sse('jenkins/:swTypeId')
  sendClientJenkinsStatus(@Param('swTypeId', ParseUUIDPipe) swTypeId: string) {
    return fromEvent(this.eventEmitter, 'new-jenkins-status').pipe(
      map((_) => ({ data: { type: 'new-jenkins-status' } })),
    );
  }
}
