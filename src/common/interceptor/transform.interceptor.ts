import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, map } from 'rxjs';

// Pagenation을 위한 Interceptor 구현 진행
@Injectable()
export class TransformInterceptor<T, R> implements NestInterceptor<T, R> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<R> {
    return next.handle().pipe(
      // rxjs의 map 메서드를 이용한다.
      map((data) => {
        // http request에서 query를 받아오기 위함.
        const http = context.switchToHttp();
        const request = http.getRequest<Request>();

        // return 하는 객체가 배열일 경우 페이지네이션을 위해 객체 항목을 수정한다.
        // 이는 저번에 작성했던 Swagger에 있는 명세와 동일하게 맞추기 위함.
        if (Array.isArray(data)) {
          return {
            page: Number(request.query['page'] || 1),
            size: Number(request.query['size'] || 20),
            items: data,
          };
        } else {
          return data;
        }
      }),
    );
  }
}
