import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserHandler } from './register-user.handler';
import { LoginHandler } from './login.handler';
import { RefreshTokenHandler } from './refresh-token.handler';
import { RegisterUserCommand } from '../commands/register-user.command';
import { LoginCommand } from '../commands/login.command';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { UserEntity } from '../../domain/entities/user.entity';
import { SessionEntity } from '../../domain/entities/session.entity';
import { UserStatus, UserType, CryptoUtils, DuplicateEntityException, UnauthorizedException } from '../../../../shared';

describe('Auth Handlers - Módulo 1 (marketplace.md)', () => {
  let mockUserRepo: any;
  let mockAuthRepo: any;
  let mockTokenGen: any;
  let mockEventEmitter: any;
  let mockCache: any;

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByPhone: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      saveOnboardingStep: vi.fn(),
    };

    mockAuthRepo = {
      createSession: vi.fn(),
      findSessionByTokenHash: vi.fn(),
      findSessionById: vi.fn(),
      findUserSessions: vi.fn(),
      revokeSession: vi.fn(),
      revokeAllUserSessions: vi.fn(),
      logSecurityEvent: vi.fn(),
    };

    mockTokenGen = {
      generateAccessToken: vi.fn().mockResolvedValue('mock_access_token'),
      generateRefreshToken: vi.fn().mockReturnValue({
        token: 'mock_raw_refresh_token',
        hash: CryptoUtils.sha256('mock_raw_refresh_token'),
        expiresAt: new Date(Date.now() + 7 * 86400000),
      }),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    mockCache = {
      set: vi.fn(),
      del: vi.fn(),
      delPattern: vi.fn(),
    };
  });

  describe('RegisterUserHandler', () => {
    it('debe registrar un nuevo usuario comprador correctamente', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation((user: UserEntity) => Promise.resolve(user));

      const handler = new RegisterUserHandler(mockUserRepo, mockAuthRepo, mockEventEmitter);
      const command = new RegisterUserCommand(
        'nuevo@example.com',
        'Password123!',
        'Nuevo',
        'Usuario',
        '+15551234567',
        UserType.BUYER,
      );

      const result = await handler.execute(command);
      expect(result.email).toBe('nuevo@example.com');
      expect(result.firstName).toBe('Nuevo');
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockUserRepo.saveOnboardingStep).toHaveBeenCalledWith(result.id, 'registro_base', 'completed');
      expect(mockAuthRepo.logSecurityEvent).toHaveBeenCalledWith(
        result.id,
        'USER_REGISTERED',
        'info',
        undefined,
        undefined,
        expect.any(Object),
      );
    });

    it('debe arrojar DuplicateEntityException si el email ya existe', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing_id' });
      const handler = new RegisterUserHandler(mockUserRepo, mockAuthRepo, mockEventEmitter);

      const command = new RegisterUserCommand(
        'duplicado@example.com',
        'Password123!',
        'Duplicado',
        'Usuario',
      );

      await expect(handler.execute(command)).rejects.toThrow(DuplicateEntityException);
    });
  });

  describe('LoginHandler', () => {
    it('debe autenticar credenciales correctas y emitir tokens', async () => {
      const passwordHash = await CryptoUtils.hashPassword('Secret1234!');
      const user = new UserEntity({
        id: 'usr-1',
        email: 'login@example.com',
        passwordHash,
        status: UserStatus.ACTIVA,
        type: UserType.BUYER,
        profile: { firstName: 'Juan', lastName: 'Pérez' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepo.findByEmail.mockResolvedValue(user);
      mockAuthRepo.createSession.mockImplementation((s: any) => Promise.resolve(s));

      const handler = new LoginHandler(mockUserRepo, mockAuthRepo, mockTokenGen, mockCache);
      const command = new LoginCommand('login@example.com', 'Secret1234!', '127.0.0.1');

      const response = await handler.execute(command);
      expect(response.accessToken).toBe('mock_access_token');
      expect(response.refreshToken).toBe('mock_raw_refresh_token');
      expect(response.user.email).toBe('login@example.com');
      expect(mockAuthRepo.createSession).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('debe rechazar contraseña inválida y registrar evento', async () => {
      const passwordHash = await CryptoUtils.hashPassword('CorrectPassword1!');
      const user = new UserEntity({
        id: 'usr-1',
        email: 'login@example.com',
        passwordHash,
        status: UserStatus.ACTIVA,
        type: UserType.BUYER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepo.findByEmail.mockResolvedValue(user);

      const handler = new LoginHandler(mockUserRepo, mockAuthRepo, mockTokenGen, mockCache);
      const command = new LoginCommand('login@example.com', 'WrongPassword!', '127.0.0.1');

      await expect(handler.execute(command)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthRepo.logSecurityEvent).toHaveBeenCalledWith(
        'usr-1',
        'LOGIN_FAILURE',
        'warning',
        '127.0.0.1',
        undefined,
        expect.any(Object),
      );
    });

    it('debe rechazar cuenta suspendida', async () => {
      const passwordHash = await CryptoUtils.hashPassword('Password123!');
      const user = new UserEntity({
        id: 'usr-1',
        email: 'login@example.com',
        passwordHash,
        status: UserStatus.SUSPENDIDA,
        type: UserType.BUYER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepo.findByEmail.mockResolvedValue(user);

      const handler = new LoginHandler(mockUserRepo, mockAuthRepo, mockTokenGen, mockCache);
      const command = new LoginCommand('login@example.com', 'Password123!', '127.0.0.1');

      await expect(handler.execute(command)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('RefreshTokenHandler - Rotación y Reuse Detection', () => {
    it('debe rotar el token correctamente ante sesión válida', async () => {
      const user = new UserEntity({
        id: 'usr-1',
        email: 'user@example.com',
        passwordHash: 'hash',
        status: UserStatus.ACTIVA,
        type: UserType.BUYER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const session = new SessionEntity({
        id: 'sess-1',
        userId: 'usr-1',
        refreshTokenHash: CryptoUtils.sha256('valid_refresh_token'),
        revokedAt: null,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      });

      mockAuthRepo.findSessionByTokenHash.mockResolvedValue(session);
      mockUserRepo.findById.mockResolvedValue(user);

      const handler = new RefreshTokenHandler(mockUserRepo, mockAuthRepo, mockTokenGen, mockCache);
      const result = await handler.execute(new RefreshTokenCommand('valid_refresh_token'));

      expect(result.accessToken).toBe('mock_access_token');
      expect(mockAuthRepo.revokeSession).toHaveBeenCalledWith('sess-1');
      expect(mockAuthRepo.createSession).toHaveBeenCalled();
    });

    it('debe detectar reutilización de token revocado y revocar todas las sesiones del usuario', async () => {
      const revokedSession = new SessionEntity({
        id: 'sess-already-revoked',
        userId: 'usr-victim',
        refreshTokenHash: CryptoUtils.sha256('stolen_token'),
        revokedAt: new Date(Date.now() - 60000),
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      });

      mockAuthRepo.findSessionByTokenHash.mockResolvedValue(revokedSession);

      const handler = new RefreshTokenHandler(mockUserRepo, mockAuthRepo, mockTokenGen, mockCache);

      await expect(handler.execute(new RefreshTokenCommand('stolen_token'))).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockAuthRepo.revokeAllUserSessions).toHaveBeenCalledWith('usr-victim');
      expect(mockCache.delPattern).toHaveBeenCalledWith('session:usr-victim:*');
      expect(mockAuthRepo.logSecurityEvent).toHaveBeenCalledWith(
        'usr-victim',
        'TOKEN_REUSE_DETECTED',
        'critical',
        undefined,
        undefined,
        expect.any(Object),
      );
    });
  });
});
