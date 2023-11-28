import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Video } from 'src/video/entity/video.entity';

@Injectable()
export class EmailService {
  // mail을 보내기 위해 mailerService를 등록
  constructor(private readonly mailerService: MailerService) {}

  async send(videos: Video[]) {
    const data = videos.map(({ id, title, downloadCnt }) => {
      return `<tr><td>${id}</td><td>${title}</td><td>${downloadCnt}</td></tr>`;
    });
    // sendMail 메서드를 통해 메일 보내기
    await this.mailerService.sendMail({
      from: 'nestjs2023@gamil.com',
      to: 'phj950610@naver.com',
      subject: 'Fastcampus Nestjs project video',
      html: `
      <table style="border: 1px solid black; width: 60%; margin: auto; text-align: center">
      <tr><th>id</th><th>title</th><th>download count</th></tr>
      ${data}
      </table>
      `,
    });
  }
}
