import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from 'src/email/email.service';
import { VideoService } from 'src/video/video.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly videoService: VideoService, private readonly emailService: EmailService) {}

  // Cron을 통해 매일 10시마다 수행
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  // Cron을 통해 매 분마다 수행
  // @Cron(CronExpression.EVERY_MINUTE)
  async handleEmailCron() {
    Logger.log('Email task called');
    const videos = await this.videoService.findTop5Download();
    this.emailService.send(videos);
  }
}
