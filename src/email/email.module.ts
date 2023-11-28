import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // 메일 설정을 위한 transport
        transport: {
          host: 'smtp.gmail.com',
          // smtp의 port는 587을 사용
          port: 587,
          auth: {
            // 로그인 하는 이메일과 password를 작성.
            // password의 경우 구글 2단계 인증을 거쳐야 한다.
            // 2단계 인증 후 앱 비밀번호를 통해서 구현 진행.
            user: configService.get('email.user'),
            pass: configService.get('email.pass'),
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
