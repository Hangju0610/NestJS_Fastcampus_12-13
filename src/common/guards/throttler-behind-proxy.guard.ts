import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    // IP가 여러 군데를 통과해서 들어오는데, 가장 첫번째 IP가 클라이언트이다.
    return req.ips.length ? req.ips[0] : req.ip;
  }
}
