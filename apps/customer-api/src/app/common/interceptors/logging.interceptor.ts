import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Interceptor that logs all HTTP requests and responses
 * including method, URL, status code, and response time
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsedTime = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.log(
            `${method} ${url} ${statusCode} - ${elapsedTime}ms`
          );
        },
        error: (error) => {
          const elapsedTime = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} ${error.status || 500} - ${elapsedTime}ms - ${error.message}`
          );
        },
      })
    );
  }
}
