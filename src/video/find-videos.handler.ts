import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindVideosQuery } from './query/find-videos.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entity/video.entity';

@Injectable()
@QueryHandler(FindVideosQuery)
export class FindVideosQueryHandler implements IQueryHandler<FindVideosQuery> {
  constructor(@InjectRepository(Video) private videoRepository: Repository<Video>) {}
  async execute({ page, size }: FindVideosQuery): Promise<any> {
    // Query를 통해 비디오 찾기 진행
    const videos = await this.videoRepository.find({ relations: ['user'], skip: page - 1, take: size });
    return videos;
  }
}
