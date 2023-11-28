import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entity/video.entity';
import { ReadStream, createReadStream } from 'fs';
import { join } from 'path';
import { stat } from 'fs/promises';

@Injectable()
export class VideoService {
  constructor(@InjectRepository(Video) private videoRepository: Repository<Video>) {}

  async findOne(id: string) {
    const video = await this.videoRepository.findOne({ relations: ['user'], where: { id } });
    if (!video) throw new NotFoundException('No video');
    return video;
  }

  async download(id: string): Promise<{ stream: ReadStream; mimetype: string; size: number }> {
    const video = await this.videoRepository.findOne({ where: { id } });
    if (!video) throw new NotFoundException('No video');

    // video Download Count 업데이트 진행
    await this.videoRepository.update({ id }, { downloadCnt: () => 'download_cnt + 1' });

    const { mimetype } = video;
    const extension = mimetype.split('/')[1];
    // ReadStream를 통해 데이터 전송 진행.
    // join을 통해 videoPath를 확인한다.
    const videoPath = join(process.cwd(), 'video-storage', `${id}.${extension}`);
    // stat를 통해 size 확인
    const { size } = await stat(videoPath);
    // Stream 생성
    const stream = createReadStream(videoPath);
    return { stream, mimetype, size };
  }
  async findTop5Download() {
    const videos = await this.videoRepository.find({
      relations: ['user'],
      order: {
        downloadCnt: 'DESC',
      },
      take: 5,
    });
    return videos;
  }
}
