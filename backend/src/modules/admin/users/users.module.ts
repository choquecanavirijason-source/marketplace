import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController, MeController, UsersController } from './controllers';
import { AuthService, UserService, SessionService } from './services';
import { AuthConfigService } from './services/auth-config.service';
import { UserRepository, SessionRepository } from './repositories';
import { JwtAdapter } from './adapters';
import { UserRepositoryPort } from './interfaces/user-repository.interface';
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
  controllers: [AuthController, MeController, UsersController],
  providers: [
    AuthService,
    UserService,
    SessionService,
    AuthConfigService,

    UserRepository,
    SessionRepository,
    JwtAdapter,

    {
      provide: UserRepositoryPort,
      useClass: UserRepository,
    },
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
    UserService,
    SessionService,
    AuthConfigService,
    UserRepository,
    SessionRepository,
    JwtAdapter,
    UserRepositoryPort,
    AuthRepositoryPort,
    TokenGeneratorPort,
  ],
})
export class UsersModule {}

