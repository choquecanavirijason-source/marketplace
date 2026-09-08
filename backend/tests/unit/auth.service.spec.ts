import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/modules/admin/users/services/auth.service';
import { UserEntity } from '../../src/modules/admin/users/entities/user.entity';
import { SessionEntity } from '../../src/modules/admin/users/entities/session.entity';
import { UserStatus, UserType } from '../../src/modules/admin/users/enums';
import { CryptoUtils, DuplicateEntityException, UnauthorizedException } from '../../src/shared';

describe('AuthService - Unit Suite', () => {
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
      findValidVerificationToken: vi.fn(),
      consumeVerificationToken: vi.fn(),
      createVerificationToken: vi.fn(),
    };

    mockTokenGen = {
      generateTokens: vi.fn().mockResolvedValue({
        accessToken: 'mock_jwt_access',
        refreshToken: 'mock_jwt_refresh',
        expiresIn: 900,
      }),
      hashRefreshToken: vi.fn().mockReturnValue(CryptoUtils.sha256('mock_jwt_refresh')),
    };

    mockEventEmitter = { emit: vi.fn() };
    mockCache = { set: vi.fn(), del: vi.fn(), delPattern: vi.fn() };
    mockMail = { sendOtpEmail: vi.fn().mockResolvedValue(true) };

    authService = new AuthService(
      mockUserRepo,
      mockAuthRepo,
      mockTokenGen,
      mockCache,
      mockMail,
      mockEventEmitter,
    );
  });

  it('debe registrar un usuario comprador e inicializar su onboarding', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockUserRepo.create.mockImplementation((user: UserEntity) => Promise.resolve(user));

    const result = await authService.register({
      email: 'juan@example.com',
      password: 'Password123!',
      firstName: 'Juan',
      lastName: 'Pérez',
      type: UserType.BUYER,
      termsAccepted: true,
    });

    expect(result.email).toBe('juan@example.com');
    expect(mockUserRepo.saveOnboardingStep).toHaveBeenCalledWith(result.id, 'base_registration', 'completed');
    expect(mockUserRepo.saveOnboardingStep).toHaveBeenCalledWith(result.id, 'terms_accepted', 'completed');
  });

  it('debe registrar un usuario vendedor de empresa con perfil comercial', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockUserRepo.create.mockImplementation((user: UserEntity) => Promise.resolve(user));

    const result = await authService.register({
      email: 'ventas@ferreteriacentral.com',
      password: 'Password123!',
      firstName: 'Roberto',
      lastName: 'Gómez',
      type: UserType.SELLER_COMPANY,
      legalName: 'Ferretería Central S.A.',
      taxId: '30-99887766-1',
    });

    expect(result.type).toBe(UserType.SELLER_COMPANY);
    expect(result.businessProfile?.legalName).toBe('Ferretería Central S.A.');
  });

  it('debe rechazar registro con correo duplicado', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing-123' });

    await expect(
      authService.register({
        email: 'existente@example.com',
        password: 'Password123!',
        firstName: 'Carlos',
      }),
    ).rejects.toThrow(DuplicateEntityException);
  });

  it('debe iniciar sesión con credenciales válidas y registrar evento de seguridad', async () => {
    const passwordHash = await CryptoUtils.hashPassword('Secret123!');
    const user = new UserEntity({
      id: 'usr-10',
      email: 'ok@example.com',
      passwordHash,
      status: UserStatus.ACTIVE,
      type: UserType.BUYER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUserRepo.findByEmail.mockResolvedValue(user);
    mockUserRepo.update.mockResolvedValue(user);

    const session = await authService.login(
      { email: 'ok@example.com', password: 'Secret123!' },
      '192.168.1.1',
      'Chrome',
    );

    expect(session.accessToken).toBe('mock_jwt_access');
    expect(session.refreshToken).toBe('mock_jwt_refresh');
    expect(mockAuthRepo.createSession).toHaveBeenCalled();
    expect(mockAuthRepo.logSecurityEvent).toHaveBeenCalledWith(
      'usr-10',
      'LOGIN_SUCCESS',
      'info',
      '192.168.1.1',
      undefined,
      expect.any(Object),
    );
  });

  it('debe rechazar login para cuentas suspendidas', async () => {
    const user = new UserEntity({
      id: 'usr-suspended',
      email: 'bloqueado@example.com',
      passwordHash: 'hash',
      status: UserStatus.SUSPENDED,
      type: UserType.BUYER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUserRepo.findByEmail.mockResolvedValue(user);

    await expect(
      authService.login({ email: 'bloqueado@example.com', password: 'Password123!' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
