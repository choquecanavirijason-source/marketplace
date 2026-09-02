import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { OtpGeneratorPort } from '../../domain/ports/otp-generator.port';
import { CacheService } from '../../../../infrastructure/cache/cache.service';

@Injectable()
export class SecureOtpGenerator implements OtpGeneratorPort {
  constructor(private readonly cacheService: CacheService) {}

  generateOtp(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      otp += digits[bytes[i] % 10];
    }
    return otp;
  }

  async storeOtp(identifier: string, otp: string, ttlSeconds = 300): Promise<void> {
    const key = `otp:${identifier.toLowerCase()}`;
    await this.cacheService.set(key, otp, ttlSeconds);
  }

  async verifyOtp(identifier: string, otp: string): Promise<boolean> {
    const key = `otp:${identifier.toLowerCase()}`;
    const stored = await this.cacheService.get<string>(key);
    if (!stored) return false;

    const isValid = stored === otp;
    if (isValid) {
      await this.cacheService.del(key);
    }
    return isValid;
  }
}
