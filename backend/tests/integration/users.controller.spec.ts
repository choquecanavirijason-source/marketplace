import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersController } from '../../src/modules/admin/users/controllers/users.controller';
import { UserService } from '../../src/modules/admin/users/services/user.service';
import { UserStatus, UserType } from '../../src/modules/admin/users/enums';

describe('UsersController - Admin Integration Suite', () => {
  let controller: UsersController;
  let mockUserService: any;

  beforeEach(() => {
    mockUserService = {
      listUsers: vi.fn(),
      getUser: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      updateStatus: vi.fn(),
      updateRoles: vi.fn(),
      getUserAudit: vi.fn(),
      deleteUser: vi.fn(),
    };

    controller = new UsersController(mockUserService as unknown as UserService);
  });

  it('debe listar usuarios con parámetros de búsqueda', async () => {
    mockUserService.listUsers.mockResolvedValue({
      data: [{ id: 'u-1', email: 'admin@ferromax.com' }],
      total: 1,
      page: 1,
      limit: 10,
    });

    const res = await controller.listUsers({ page: 1, limit: 10, search: 'admin' } as any);

    expect(res.data).toHaveLength(1);
    expect(mockUserService.listUsers).toHaveBeenCalled();
  });

  it('debe obtener un usuario por ID', async () => {
    mockUserService.getUser.mockResolvedValue({
      id: 'u-target',
      toJSON: () => ({ id: 'u-target', email: 'target@example.com' }),
    });

    const res = await controller.getUser('u-target');

    expect(res.id).toBe('u-target');
    expect(mockUserService.getUser).toHaveBeenCalledWith('u-target');
  });

  it('debe actualizar el estado de un usuario (bloqueo/activación)', async () => {
    mockUserService.updateStatus.mockResolvedValue({
      id: 'u-target',
      status: UserStatus.SUSPENDED,
    });

    const admin: any = { id: 'admin-1' };
    const req: any = { ip: '10.0.0.1' };
    const dto = { status: UserStatus.SUSPENDED, reason: 'Violación de términos' };

    const res = await controller.updateStatus('u-target', dto as any, admin, req);

    expect(res.status).toBe(UserStatus.SUSPENDED);
    expect(mockUserService.updateStatus).toHaveBeenCalledWith(
      'u-target',
      UserStatus.SUSPENDED,
      'Violación de términos',
      'admin-1',
      '10.0.0.1',
    );
  });

  it('debe eliminar lógicamente un usuario', async () => {
    mockUserService.deleteUser.mockResolvedValue(true);

    await controller.deleteUser('u-delete');

    expect(mockUserService.deleteUser).toHaveBeenCalledWith('u-delete');
  });
});
