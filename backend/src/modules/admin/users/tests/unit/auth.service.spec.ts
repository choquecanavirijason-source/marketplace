import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../services/auth.service';
import { UserEntity } from '../../entities/user.entity';
import { SessionEntity } from '../../entities/session.entity';
import { UserStatus, UserType } from '../../enums';
import { CryptoUtils, DuplicateEntityException, UnauthorizedException } from '../../../../../shared';

describe('AuthService - Unit Tests', () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockAuthRepo: any;
  let mockTokenGen: any;
  let mockEventEmitter: any;
  let mockCache: any;
  let mockMail: any;

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
      updateSession: vi.fn(),
      revokeSessionById: vi.fn(),
      revokeAllUserSessions: vi.fn(),
      logSecurityEvent: vi.fn(),
      saveEmailOtp: vi.fn(),
      verifyEmailOtp: vi.fn(),
    };

    mockTokenGen = {
      generateTokens: vi.fn().mockResolvedValue({
        accessToken: 'mock_access_token',
        refreshToken: 'mock_raw_refresh_token',
        expiresIn: 900,
      }),
      hashRefreshToken: vi.fn().mockReturnValue(CryptoUtils.sha256('mock_raw_refresh_token')),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    mockCache = {
      set: vi.fn(),
      del: vi.fn(),
      delPattern: vi.fn(),
    };

    mockMail = {
      sendOtpEmail: vi.fn().mockResolvedValue(true),
    };

    authService = new AuthService(
      mockUserRepo,
      mockAuthRepo,
      mockTokenGen,
      mockCache,
      mockMail,
      mockEventEmitter,
    );
  });

  describe('register', () => {
    it('debe registrar un nuevo usuario comprador correctamente', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation((user: UserEntity) => Promise.resolve(user));

      const result = await authService.register({
        email: 'nuevo@example.com',
        password: 'Password123!',
        firstName: 'Nuevo',
        lastName: 'Usuario',
        phone: '+15551234567',
        type: UserType.BUYER,
      });

      expect(result.email).toBe('nuevo@example.com');
      expect(result.firstName).toBe('Nuevo');
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockUserRepo.saveOnboardingStep).toHaveBeenCalledWith(result.id, 'base_registration', 'completed');
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

      await expect(
        authService.register({
          email: 'duplicado@example.com',
          password: 'Password123!',
          firstName: 'Duplicado',
          lastName: 'Usuario',
        }),
      ).rejects.toThrow(DuplicateEntityException);
    });
  });

  describe('login', () => {
    it('debe autenticar credenciales válidas y retornar tokens', async () => {
      const passwordHash = await CryptoUtils.hashPassword('Password123!');
      const fakeUser = new UserEntity({
        id: 'usr-1',
        email: 'login@example.com',
        passwordHash,
        status: UserStatus.ACTIVE,
        type: UserType.BUYER,
        profile: { firstName: 'Login', lastName: 'User', language: 'es', currency: 'ARS' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepo.findByEmail.mockResolvedValue(fakeUser);
      mockUserRepo.update.mockResolvedValue(fakeUser);

      const result = await authService.login(
        { email: 'login@example.com', password: 'Password123!' },
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_raw_refresh_token');
      expect(mockAuthRepo.createSession).toHaveBeenCalled();
      expect(mockAuthRepo.logSecurityEvent).toHaveBeenCalledWith(
        'usr-1',
        'LOGIN_SUCCESS',
        'info',
        '127.0.0.1',
        undefined,
        expect.any(Object),
      );
    });

    it('debe arrojar UnauthorizedException si el usuario no existe', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'noexiste@example.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('debe refrescar tokens para una sesión activa válida', async () => {
      const fakeSession = new SessionEntity({
        id: 'sess-1',
        userId: 'usr-1',
        refreshTokenHash: CryptoUtils.sha256('token_valido'),
        expiresAt: new Date(Date.now() + 86400000),
        isRevoked: false,
        createdAt: new Date(),
      });

      const fakeUser = new UserEntity({
        id: 'usr-1',
        email: 'user@example.com',
        passwordHash: 'hash',
        status: UserStatus.ACTIVE,
        type: UserType.BUYER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockAuthRepo.findSessionByTokenHash.mockResolvedValue(fakeSession);
      mockUserRepo.findById.mockResolvedValue(fakeUser);

      const result = await authService.refreshToken('token_valido');

      expect(result.accessToken).toBe('mock_access_token');
      expect(mockAuthRepo.updateSession).toHaveBeenCalled();
    });
  });
});
