import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { VideoCreatedEvent } from './event/video-created.event';
import { Injectable } from '@nestjs/common';

@Injectable()
@EventsHandler(VideoCreatedEvent)
export class VideoCreatedHandler implements IEventHandler<VideoCreatedEvent> {
  handle(event: VideoCreatedEvent) {
    // 비디오 업데이트가 완료되면 console로 알려주기.
    console.info(`Video created(id: ${event.id})`);
  }
}
