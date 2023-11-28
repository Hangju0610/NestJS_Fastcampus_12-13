import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateVideoCommand } from './command/create-video.command';
import { DataSource } from 'typeorm';
import { Video } from './entity/video.entity';
import { User } from 'src/user/entity/user.entity';
import { VideoCreatedEvent } from './event/video-created.event';

@Injectable()
@CommandHandler(CreateVideoCommand)
// CreateVideoHandler를 따로 만들어준다.
export class CreateVideoHandler implements ICommandHandler<CreateVideoCommand> {
  constructor(private dataSource: DataSource, private eventBus: EventBus) {}

  async execute(command: CreateVideoCommand): Promise<Video> {
    // 동영상 업로드 시 Transaction을 진행한다.
    const { userId, title, mimetype, extension, buffer } = command;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      const video = await queryRunner.manager.save(queryRunner.manager.create(Video, { title, mimetype, user }));
      // 업로드 로직을 실행.
      await this.uploadVideo(video.id, extension, buffer);
      await queryRunner.commitTransaction();
      // 업로드가 완료되면 이벤트를 발생시킨다.
      this.eventBus.publish(new VideoCreatedEvent(video.id));
      return video;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async uploadVideo(id: string, extension: string, buffer: Buffer) {
    console.log('upload video');
  }
}
