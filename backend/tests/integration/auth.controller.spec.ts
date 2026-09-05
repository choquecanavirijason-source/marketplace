import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from '../../src/modules/users/controllers/auth.controller';
import { AuthService } from '../../src/modules/users/services/auth.service';

describe('AuthController - Integration Suite', () => {
  let controller: AuthController;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
      otpLogin: vi.fn(),
      sendEmailOtp: vi.fn(),
      sendPhoneOtp: vi.fn(),
      verifyPhoneOtp: vi.fn(),
      refreshToken: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
    };

    controller = new AuthController(mockAuthService as unknown as AuthService);
  });

  it('debe registrar un usuario y retornar formato toJSON', async () => {
    mockAuthService.register.mockResolvedValue({
      toJSON: () => ({ id: 'u-1', email: 'test@example.com', type: 'buyer' }),
    });

    const res = await controller.register({
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(res).toEqual({ id: 'u-1', email: 'test@example.com', type: 'buyer' });
    expect(mockAuthService.register).toHaveBeenCalled();
  });

  it('debe autenticar credenciales y setear cookie de refresh token', async () => {
    mockAuthService.login.mockResolvedValue({
      user: { id: 'u-1', email: 'test@example.com' },
      accessToken: 'access.jwt',
      refreshToken: 'refresh.jwt',
      expiresIn: 900,
    });

    const setCookie = vi.fn();
    const reply: any = { setCookie };
    const req: any = { ip: '127.0.0.1', headers: { 'user-agent': 'Vitest' } };

    const result = await controller.login(
      { email: 'test@example.com', password: 'Password123!' },
      req,
      reply,
    );

    expect(result.accessToken).toBe('access.jwt');
    expect(setCookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh.jwt',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });

  it('debe procesar cierre de sesión y limpiar cookie', async () => {
    const clearCookie = vi.fn();
    const reply: any = { clearCookie };
    const req: any = { cookies: { refresh_token: 'old_cookie' } };

    const result = await controller.logout({ id: 'u-1', email: 'test@example.com', roles: ['buyer'], permissions: [], kycLevel: 0, status: 'active' }, req, reply);

    expect(result).toEqual({ message: 'Sesión cerrada correctamente.' });
    expect(mockAuthService.logout).toHaveBeenCalledWith(undefined, 'u-1', 'old_cookie');
    expect(clearCookie).toHaveBeenCalledWith('refresh_token', { path: '/' });
  });
});
