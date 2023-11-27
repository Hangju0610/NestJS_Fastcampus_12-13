import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // 네스트에서 제공하는 로거 기능을 이용한다.
  // HTTP 컨텍스트 기반으로 동작하도록 구현
  private logger = new Logger('HTTP');

  // use를 사용하여 미들웨어 구성
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    // request에서 필요한 정보 추출하기
    const { ip, method, originalUrl: url } = req;
    // 사용자 Agent (MacOS 쓰는지, window 쓰는지)
    const userAgent = req.get('user-agent') || '';

    // 응답이 완료된다면
    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;
      this.logger.log(`${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip} ${responseTime}ms`);
    });

    next();
  }
}
