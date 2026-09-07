import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';
import { ApiResponse } from '../../shared';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.headers['x-correlation-id'];

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && Array.isArray((data as any).items) && typeof (data as any).total === 'number') {
          const items = (data as any).items.map((i: any) => instanceToPlain(i));
          const total = Number((data as any).total);
          const page = Number((data as any).page ?? 1);
          const limit = Number((data as any).limit ?? items.length) || 10;
          const totalPages = Number((data as any).totalPages ?? Math.max(1, Math.ceil(total / limit)));

          return {
            success: true,
            data: items,
            pagination: {
              page,
              limit,
              total,
              totalPages,
            },
            meta: {
              timestamp: new Date().toISOString(),
              ...(correlationId ? { correlationId } : {}),
            },
          };
        }

        const serializedData = data && typeof data === 'object' ? instanceToPlain(data) : data;

        return {
          success: true,
          data: serializedData,
          meta: {
            timestamp: new Date().toISOString(),
            ...(correlationId ? { correlationId } : {}),
          },
        };
      }),
    );
  }
}
