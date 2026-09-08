import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MeController } from '../../src/modules/admin/users/controllers/me.controller';
import { UserService } from '../../src/modules/admin/users/services/user.service';
import { SessionService } from '../../src/modules/admin/users/services/session.service';

describe('MeController - Integration Suite', () => {
  let controller: MeController;
  let mockUserService: any;
  let mockSessionService: any;

  beforeEach(() => {
    mockUserService = {
      getUser: vi.fn(),
      updateProfile: vi.fn(),
      updateBusinessProfile: vi.fn(),
    };

    mockSessionService = {
      listSessions: vi.fn(),
      revokeSession: vi.fn(),
    };

    controller = new MeController(
      mockUserService as unknown as UserService,
      mockSessionService as unknown as SessionService,
    );
  });

  it('debe retornar el usuario actual con sus permisos', async () => {
    mockUserService.getUser.mockResolvedValue({
      id: 'usr-current',
      email: 'user@example.com',
      toJSON: () => ({ id: 'usr-current', email: 'user@example.com' }),
      permissions: ['users:read'],
    });

    const currentUser: any = {
      id: 'usr-current',
      email: 'user@example.com',
      roles: ['buyer'],
      permissions: ['users:read', 'orders:create'],
    };

    const result = await controller.getMe(currentUser);

    expect(result.id).toBe('usr-current');
    expect(result.permissions).toEqual(['users:read', 'orders:create']);
    expect(mockUserService.getUser).toHaveBeenCalledWith('usr-current');
  });

  it('debe actualizar el perfil de usuario exitosamente', async () => {
    mockUserService.updateProfile.mockResolvedValue({
      toJSON: () => ({ id: 'usr-current', firstName: 'Carlos', lastName: 'Gomez' }),
    });

    const currentUser: any = { id: 'usr-current' };
    const dto = { firstName: 'Carlos', lastName: 'Gomez' };

    const result = await controller.updateProfile(currentUser, dto as any);

    expect(result.firstName).toBe('Carlos');
    expect(mockUserService.updateProfile).toHaveBeenCalledWith('usr-current', dto);
  });

  it('debe listar sesiones activas del usuario', async () => {
    mockSessionService.listSessions.mockResolvedValue([
      { id: 'sess-1', device: 'Chrome Windows', ip: '127.0.0.1' },
      { id: 'sess-2', device: 'Mobile Safari', ip: '192.168.1.5' },
    ]);

    const currentUser: any = { id: 'usr-current' };
    const req: any = { ip: '127.0.0.1', headers: { 'user-agent': 'Chrome Windows' } };
    const sessions = await controller.listSessions(currentUser, req);

    expect(sessions).toHaveLength(2);
    expect(sessions[0].isCurrent).toBe(true);
    expect(mockSessionService.listSessions).toHaveBeenCalledWith('usr-current');
  });

  it('debe revocar una sesión específica del usuario', async () => {
    mockSessionService.revokeSession.mockResolvedValue(true);

    const currentUser: any = { id: 'usr-current' };
    await controller.revokeSession('sess-1', currentUser);

    expect(mockSessionService.revokeSession).toHaveBeenCalledWith('sess-1', 'usr-current');
  });
});
