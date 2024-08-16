import { Injectable, MessageEvent } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Observable, Subject, filter, map } from "rxjs";

@Injectable()
export class SseService {
  constructor(private eventEmitter: EventEmitter2) { }
  private comment$: Subject<any> = new Subject();


  emitCommentPostedEvent(commentId: string) {
    this.comment$.next({ commentId: commentId });
    this.eventEmitter.emit('new-comment');
    return { result: 'ok' };
  }
}