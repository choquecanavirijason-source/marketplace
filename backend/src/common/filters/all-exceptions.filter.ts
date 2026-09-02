import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { DomainException, ApplicationException, InfrastructureException } from '../../shared';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'Ocurrió un error inesperado en el servidor.';
    let type = 'https://api.marketplace.com/errors/internal';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      title = 'Validation Error';
      type = 'https://api.marketplace.com/errors/validation';
      detail = 'Uno o más campos enviados no cumplen con los requisitos.';
      errors = {};
      for (const issue of exception.issues) {
        const field = issue.path.join('.') || 'payload';
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
    } else if (exception instanceof DomainException) {
      status = exception.statusCode;
      title = 'Business Rule Violation';
      type = `https://api.marketplace.com/errors/domain/${exception.code.toLowerCase()}`;
      detail = exception.message;
    } else if (exception instanceof ApplicationException) {
      status = exception.statusCode;
      title = 'Application Error';
      type = `https://api.marketplace.com/errors/application/${exception.code.toLowerCase()}`;
      detail = exception.message;
    } else if (exception instanceof InfrastructureException) {
      status = exception.statusCode;
      title = 'Infrastructure Error';
      type = `https://api.marketplace.com/errors/infrastructure/${exception.code.toLowerCase()}`;
      detail = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      title = exception.name;
      type = 'https://api.marketplace.com/errors/http';
      const res = exception.getResponse();
      detail = typeof res === 'string' ? res : (res as { message?: string }).message || exception.message;
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const correlationId = (request.headers['x-correlation-id'] as string) || 'none';

    this.logger.error(
      `[${correlationId}] ${request.method} ${request.url} - Status ${status}: ${detail}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const problemDetails = {
      type,
      title,
      status,
      detail,
      instance: request.url,
      timestamp: new Date().toISOString(),
      traceId: correlationId,
      ...(errors ? { errors } : {}),
    };

    response.status(status).send(problemDetails);
  }
}
