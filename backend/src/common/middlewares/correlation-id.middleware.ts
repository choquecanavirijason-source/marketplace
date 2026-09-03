import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CryptoUtils } from '../../shared';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const headerName = 'x-correlation-id';
    const correlationId = (req.headers[headerName] as string) || CryptoUtils.generateRandomToken(16);

    req.headers[headerName] = correlationId;
    res.setHeader(headerName, correlationId);

    next();
  }
}
