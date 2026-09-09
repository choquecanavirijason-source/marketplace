import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './controllers';
import { AuthService, AuthConfigService, SessionService } from './services';
import { SessionRepository } from './repositories';
import {
  JwtAdapter,
  GoogleOAuthAdapter,
  FacebookOAuthAdapter,
  AppleOAuthAdapter,
} from './adapters';
import { AuthRepositoryPort } from './interfaces/auth-repository.interface';
import { TokenGeneratorPort } from './interfaces/token-generator.interface';

import { appConfig } from '../../../config';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: appConfig.jwt.accessSecret,
      signOptions: { expiresIn: appConfig.jwt.accessExpiresIn as unknown as number },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthConfigService,
    SessionService,

    SessionRepository,
    JwtAdapter,
    GoogleOAuthAdapter,
    FacebookOAuthAdapter,
    AppleOAuthAdapter,

    {
      provide: AuthRepositoryPort,
      useClass: SessionRepository,
    },
    {
      provide: TokenGeneratorPort,
      useClass: JwtAdapter,
    },
  ],
  exports: [
    JwtModule,
    AuthService,
    AuthConfigService,
    SessionService,
    SessionRepository,
    JwtAdapter,
    GoogleOAuthAdapter,
    FacebookOAuthAdapter,
    AppleOAuthAdapter,
    AuthRepositoryPort,
    TokenGeneratorPort,
  ],
})
export class AuthModule {}
