import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './presentation/auth.controller';
import { MeController } from './presentation/me.controller';
import { UsersController } from './presentation/users.controller';

import { RegisterUserHandler } from './application/handlers/register-user.handler';
import { LoginHandler } from './application/handlers/login.handler';
import { OtpLoginHandler } from './application/handlers/otp-login.handler';
import { RefreshTokenHandler } from './application/handlers/refresh-token.handler';
import { LogoutHandler } from './application/handlers/logout.handler';
import { LogoutAllHandler } from './application/handlers/logout-all.handler';
import { ForgotPasswordHandler } from './application/handlers/forgot-password.handler';
import { ResetPasswordHandler } from './application/handlers/reset-password.handler';
import { VerifyEmailHandler } from './application/handlers/verify-email.handler';
import { SendPhoneOtpHandler } from './application/handlers/send-phone-otp.handler';
import { SendEmailOtpHandler } from './application/handlers/send-email-otp.handler';
import { VerifyPhoneOtpHandler } from './application/handlers/verify-phone-otp.handler';

import { GetUserQuery } from './application/queries/get-user.query';
import { ListUsersQuery } from './application/queries/list-users.query';
import { UpdateProfileHandler } from './application/handlers/update-profile.handler';
import { UpdateBusinessProfileHandler } from './application/handlers/update-business-profile.handler';
import { ListSessionsQuery } from './application/queries/list-sessions.query';
import { RevokeSessionHandler } from './application/handlers/revoke-session.handler';

import { AdminCreateUserHandler } from './application/handlers/admin-create-user.handler';
import { AdminUpdateUserHandler } from './application/handlers/admin-update-user.handler';
import { AdminDeleteUserHandler } from './application/handlers/admin-delete-user.handler';
import { AdminUpdateUserStatusHandler } from './application/handlers/admin-update-user-status.handler';
import { AdminUpdateUserRolesHandler } from './application/handlers/admin-update-user-roles.handler';
import { AdminGetUserAuditQuery } from './application/queries/admin-get-user-audit.query';

import { UserRepositoryPort } from './domain/ports/user-repository.port';
import { PostgresUserRepository } from './infrastructure/repositories/postgres-user.repository';
import { AuthRepositoryPort } from './domain/ports/auth-repository.port';
import { SessionRepository } from './infrastructure/repositories/session.repository';
import { TokenGeneratorPort } from './domain/ports/token-generator.port';
import { JwtTokenProvider } from './infrastructure/providers/jwt-token-provider';

import { appConfig } from '../../config';

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
    RegisterUserHandler,
    LoginHandler,
    OtpLoginHandler,
    RefreshTokenHandler,
    LogoutHandler,
    LogoutAllHandler,
    ForgotPasswordHandler,
    ResetPasswordHandler,
    VerifyEmailHandler,
    SendPhoneOtpHandler,
    SendEmailOtpHandler,
    VerifyPhoneOtpHandler,

    GetUserQuery,
    ListUsersQuery,
    UpdateProfileHandler,
    UpdateBusinessProfileHandler,
    ListSessionsQuery,
    RevokeSessionHandler,

    AdminCreateUserHandler,
    AdminUpdateUserHandler,
    AdminDeleteUserHandler,
    AdminUpdateUserStatusHandler,
    AdminUpdateUserRolesHandler,
    AdminGetUserAuditQuery,

    {
      provide: UserRepositoryPort,
      useClass: PostgresUserRepository,
    },
    {
      provide: AuthRepositoryPort,
      useClass: SessionRepository,
    },
    {
      provide: TokenGeneratorPort,
      useClass: JwtTokenProvider,
    },
  ],
  exports: [
    JwtModule,
    UserRepositoryPort,
    AuthRepositoryPort,
    TokenGeneratorPort,
    GetUserQuery,
    ListUsersQuery,
    RegisterUserHandler,
    LoginHandler,
  ],
})
export class UsersModule {}
