import { SetMetadata } from '@nestjs/common';
import { KycLevel } from '../../shared';

export const KYC_LEVEL_KEY = 'kycLevel';
export const RequireKycLevel = (level: KycLevel) => SetMetadata(KYC_LEVEL_KEY, level);
