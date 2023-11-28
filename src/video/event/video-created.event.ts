import { IEvent } from '@nestjs/cqrs';

// command가 정상 처리 되었으면 Event 발생
export class VideoCreatedEvent implements IEvent {
  constructor(readonly id: string) {}
}
