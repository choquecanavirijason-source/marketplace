import { Module } from '@nestjs/common';
import { KycController } from './controllers/kyc.controller';
import { KycService } from './services/kyc.service';
import { BiometricalVerifyAdapter } from './adapters/biometrical-verify.adapter';

@Module({
  controllers: [KycController],
  providers: [KycService, BiometricalVerifyAdapter],
  exports: [KycService, BiometricalVerifyAdapter],
})
export class KycModule {}
