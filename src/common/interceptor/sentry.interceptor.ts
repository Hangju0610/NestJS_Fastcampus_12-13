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
      catchError((error) => {
        Sentry.captureException(error);
        const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK);
        webhook.send({
          attachments: [
            {
              text: 'NestJS 프로젝트 에러 발생',
              fields: [
                {
                  title: `Error message: ${error.response?.message} || ${error.message}`,
                  value: `URL: ${url}\n${error.stack}`,
                  short: false,
                },
              ],
              ts: Math.floor(new Date().getTime() / 1000).toString(),
            },
          ],
        });
        throw error;
      }),
    );
  }
}
