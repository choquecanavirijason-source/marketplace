import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../../src/modules/admin/auth/services/auth.service';
import { UserService } from '../../src/modules/admin/users/services/user.service';
import { SessionService } from '../../src/modules/admin/auth/services/session.service';
import { UserEntity } from '../../src/modules/admin/users/entities/user.entity';
import { SessionEntity } from '../../src/modules/admin/auth/entities/session.entity';
import { UserStatus, UserType } from '../../src/modules/admin/users/enums';
import { CryptoUtils } from '../../src/shared';

describe('Auth Flow - E2E LifeCycle Suite', () => {
  it('debe ejecutar el ciclo de vida completo: Registro -> Login -> Perfil -> Refresh -> Revocación Remota', async () => {
    const memoryUsers: Map<string, UserEntity> = new Map();
    const memorySessions: Map<string, SessionEntity> = new Map();
    const memoryEvents: any[] = [];

    const mockUserRepo: any = {
      findByEmail: vi.fn(async (email: string) => {
        for (const u of memoryUsers.values()) {
          if (u.email === email) return u;
        }
        return null;
      }),
      findById: vi.fn(async (id: string) => memoryUsers.get(id) || null),
      create: vi.fn(async (user: UserEntity) => {
        memoryUsers.set(user.id, user);
        return user;
      }),
      update: vi.fn(async (user: UserEntity) => {
        memoryUsers.set(user.id, user);
        return user;
      }),
      saveOnboardingStep: vi.fn(async () => {}),
      list: vi.fn(async () => ({ items: Array.from(memoryUsers.values()), total: memoryUsers.size })),
    };

    const mockAuthRepo: any = {
      createSession: vi.fn(async (session: SessionEntity) => {
        memorySessions.set(session.id, session);
        return session;
      }),
      findSessionByTokenHash: vi.fn(async (hash: string) => {
        for (const s of memorySessions.values()) {
          if (s.refreshTokenHash === hash) return s;
        }
        return null;
      }),
      findActiveSessionsByUserId: vi.fn(async (userId: string) => {
        return Array.from(memorySessions.values()).filter((s) => s.userId === userId && !s.isRevoked);
      }),
      updateSession: vi.fn(async (session: SessionEntity) => {
        memorySessions.set(session.id, session);
      }),
      revokeSessionById: vi.fn(async (sessionId: string) => {
        const s = memorySessions.get(sessionId);
        if (s) s.revoke();
      }),
      revokeAllUserSessions: vi.fn(async (userId: string) => {
        for (const s of memorySessions.values()) {
          if (s.userId === userId) s.revoke();
        }
      }),
      logSecurityEvent: vi.fn(async (...args) => {
        memoryEvents.push(args);
      }),
    };

    const mockTokenGen: any = {
      generateTokens: vi.fn(async (payload: any) => ({
        accessToken: `jwt_access_${payload.sub}`,
        refreshToken: `jwt_refresh_${payload.sub}`,
        expiresIn: 900,
      })),
      hashRefreshToken: vi.fn(async (token: string) => CryptoUtils.sha256(token)),
    };

    const mockCache: any = { set: vi.fn(), del: vi.fn(), delPattern: vi.fn() };
    const mockMail: any = { sendOtpEmail: vi.fn().mockResolvedValue(true) };
    const mockEmitter: any = { emit: vi.fn() };

    const authService = new AuthService(
      mockUserRepo,
      mockAuthRepo,
      mockTokenGen,
      mockCache,
      mockMail,
      mockEmitter,
    );
    const userService = new UserService(mockUserRepo, mockAuthRepo);
    const sessionService = new SessionService(mockAuthRepo);
    const registeredUser = await authService.register({
      email: 'comprador.e2e@marketplace.com',
      password: 'StrongPassword123!',
      firstName: 'Comprador',
      lastName: 'E2E',
      type: UserType.BUYER,
      termsAccepted: true,
    });
    expect(registeredUser.id).toBeDefined();
    expect(registeredUser.email).toBe('comprador.e2e@marketplace.com');
    const loginResult = await authService.login(
      { email: 'comprador.e2e@marketplace.com', password: 'StrongPassword123!' },
      '192.168.1.50',
      'Mozilla/5.0',
    );
    expect(loginResult.accessToken).toContain('jwt_access_');
    expect(loginResult.refreshToken).toContain('jwt_refresh_');
    const profileUser = await userService.getUser(registeredUser.id);
    expect(profileUser.fullName).toBe('Comprador E2E');

    await userService.updateProfile(registeredUser.id, {
      firstName: 'Comprador Actualizado',
      lastName: 'E2E Modificado',
      language: 'es',
      currency: 'ARS',
    });
    const updatedUser = await userService.getUser(registeredUser.id);
    expect(updatedUser.fullName).toBe('Comprador Actualizado E2E Modificado');
    const activeSessions = await sessionService.listSessions(registeredUser.id);
    expect(activeSessions.length).toBe(1);
    const currentSessionId = activeSessions[0].id;
    const refreshResult = await authService.refreshToken(loginResult.refreshToken);
    expect(refreshResult.accessToken).toBeDefined();
    await sessionService.revokeSession(currentSessionId, registeredUser.id);
    const remainingSessions = await sessionService.listSessions(registeredUser.id);
    expect(remainingSessions.length).toBe(0);
    expect(memoryEvents.length).toBeGreaterThanOrEqual(2);
  });
});
