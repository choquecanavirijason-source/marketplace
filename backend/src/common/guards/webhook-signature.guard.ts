import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CryptoUtils } from '../../shared';
import { env } from '../../config';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature =
      (request.headers['x-webhook-signature'] as string) ||
      (request.headers['x-hub-signature-256'] as string);

    if (!signature) {
      throw new UnauthorizedException('Falta la firma del webhook en los headers.');
    }

    const payload =
      typeof request.body === 'string'
        ? request.body
        : JSON.stringify(request.body ?? {});

    const isValid = CryptoUtils.verifyHmacSha256(
      payload,
      signature,
      env.KYC_WEBHOOK_SECRET,
    );

    if (!isValid) {
      throw new UnauthorizedException('Firma HMAC del webhook inválida.');
    }

    return true;
  }
}
