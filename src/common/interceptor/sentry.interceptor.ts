import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, catchError } from 'rxjs';
import * as Sentry from '@sentry/node';
import { IncomingWebhook } from '@slack/webhook';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const { url } = req;
    return next.handle().pipe(
      // catchError를 통해 error가 발생한 경우 수집 진행
      catchError((error) => {
        // sentry에 에러 전달
        Sentry.captureException(error);
        // slack의 webhook을 통해 메세지 전달
        const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK);
        // 메세지 전달 기능 제공
        webhook.send({
          attachments: [
            {
              // 메세지 내용 전달
              text: 'NestJS 프로젝트 에러 발생',
              fields: [
                {
                  // 제목 입력
                  title: `Error message: ${error.response?.message} || ${error.message}`,
                  value: `URL: ${url}\n${error.stack}`,
                  short: false,
                },
              ],
              // 시간 전달
              ts: Math.floor(new Date().getTime() / 1000).toString(),
            },
          ],
        });
        throw error;
      }),
    );
  }
}
