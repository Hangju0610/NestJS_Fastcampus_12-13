import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/common/decorator/public.decorator';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Public인지 아닌지를 reflector라는 것을 통해 받는다.
  constructor(private reflector: Reflector, private jwtService: JwtService) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const http = context.switchToHttp();
    const { url, headers } = http.getRequest<Request>();
    const token = /Bearer\s(.+)/.exec(headers['authorization'])[1];
    // 키 없이 디코딩이 가능하다.
    const decoded = this.jwtService.decode(token);

    if (url !== '/api/auth/refresh' && decoded['tokenType'] === 'refresh') {
      console.error('accessToken is required');
      throw new UnauthorizedException();
    }
    return super.canActivate(context);
  }
}
