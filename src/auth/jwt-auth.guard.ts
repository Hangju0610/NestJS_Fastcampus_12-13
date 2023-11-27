import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, Inject, Injectable, Logger, LoggerService, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/common/decorator/public.decorator';
import { Request } from 'express';
import { Role } from 'src/user/enum/user.enum';
import { ROLES_KEY } from 'src/common/decorator/role.decorator';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Public인지 아닌지를 reflector라는 것을 통해 받는다.
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService,
    @Inject(Logger) private logger: LoggerService,
  ) {
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

    // url이 refresh가 아니거나, 토큰타입이 refresh가 아닌경우
    // 에러 처리 진행
    if (url !== '/api/auth/refresh' && decoded['tokenType'] === 'refresh') {
      const error = new UnauthorizedException('accessToken is required');
      this.logger.error(error.message, error.stack);
      throw error;
    }

    // role 추가 진행
    // 데코레이터를 이용하여 권한 확인 진행
    // 데코레이터를 통해 ADMIN을 부여한 경우 ADMIN 출력
    // 그렇지 않은 경우 undefined 출력한다.
    // metadata에 ROLES_KEY를 Override를 진행해준다.
    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requireRoles) {
      const userId = decoded['sub'];
      // user가 ADMIN인 경우 true, 아니면 false 출력
      return this.userService.checkUserIsAdmin(userId);
    }
    return super.canActivate(context);
  }
}
