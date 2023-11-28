import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoModule } from 'src/video/video.module';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [ScheduleModule.forRoot(), VideoModule, EmailModule],
  providers: [AnalyticsService, EmailService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
