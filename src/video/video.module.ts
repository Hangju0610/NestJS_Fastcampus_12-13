import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entity/video.entity';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateVideoHandler } from './create-video.handler';
import { VideoCreatedHandler } from './video-created.handler';
import { FindVideosQueryHandler } from './find-videos.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Video]), CqrsModule],
  controllers: [VideoController],
  providers: [
    VideoService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // cqrs 핸들러를 provider로 등록
    CreateVideoHandler,
    VideoCreatedHandler,
    FindVideosQueryHandler,
  ],
  exports: [VideoService],
})
export class VideoModule {}
