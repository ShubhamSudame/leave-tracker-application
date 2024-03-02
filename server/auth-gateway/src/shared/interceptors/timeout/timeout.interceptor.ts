import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  GatewayTimeoutException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, TimeoutError, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutMs = Number(
      this.configService.getOrThrow<number>('TIMEOUT_INTERVAL'),
    );
    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          throw new GatewayTimeoutException('Request timed out');
        }
        return throwError(() => error);
      }),
    );
  }
}
