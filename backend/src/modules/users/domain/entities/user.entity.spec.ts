import { describe, it, expect } from 'vitest';
import { UserEntity } from './user.entity';
import { UserStatus, UserType } from '../../../../shared';

describe('UserEntity - Dominio Módulo 1 (marketplace.md)', () => {
  it('debe inicializar un usuario comprador con valores por defecto', () => {
    const user = new UserEntity({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'juan.perez@example.com',
      passwordHash: 'hashed_secret_password',
      status: UserStatus.ACTIVA,
      type: UserType.BUYER,
      profile: {
        firstName: 'Juan',
        lastName: 'Pérez',
        language: 'es',
        currency: 'USD',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(user.fullName).toBe('Juan Pérez');
    expect(user.email).toBe('juan.perez@example.com');
    expect(user.type).toBe(UserType.BUYER);
    expect(user.roles).toContain('buyer');
    expect(user.permissions.length).toBeGreaterThan(0);
    expect(user.completionPct).toBeGreaterThanOrEqual(20);
    expect(user.deletedAt).toBeUndefined();
  });

  it('debe recalcular correctamente el porcentaje de completitud al verificar email y teléfono', () => {
    const user = new UserEntity({
      id: '123e4567-e89b-12d3-a456-426614174001',
      email: 'maria.gomez@example.com',
      passwordHash: 'hash',
      status: UserStatus.PENDIENTE,
      type: UserType.BUYER,
      profile: {
        firstName: 'María',
        lastName: 'Gómez',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const initialPct = user.calculateCompletionPct();
    user.verifyEmail();
    const withEmail = user.calculateCompletionPct();
    expect(withEmail).toBeGreaterThan(initialPct);

    user.verifyPhone();
    const withPhone = user.calculateCompletionPct();
    expect(withPhone).toBeGreaterThan(withEmail);
    expect(user.emailVerified).toBe(true);
  });

  it('debe soportar transiciones de estado de cuenta y soft delete lógico', () => {
    const user = new UserEntity({
      id: '123e4567-e89b-12d3-a456-426614174002',
      email: 'test@example.com',
      passwordHash: 'hash',
      status: UserStatus.PENDIENTE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    user.activate();
    expect(user.status).toBe(UserStatus.ACTIVA);

    user.suspend();
    expect(user.status).toBe(UserStatus.SUSPENDIDA);

    user.restrict();
    expect(user.status).toBe(UserStatus.RESTRINGIDA);

    user.sendToReview();
    expect(user.status).toBe(UserStatus.EN_REVISION);

    user.reject();
    expect(user.status).toBe(UserStatus.RECHAZADA);

    user.softDelete();
    expect(user.status).toBe(UserStatus.ELIMINADA_LOGICAMENTE);
    expect(user.deletedAt).toBeInstanceOf(Date);
  });

  it('debe permitir crear perfiles comerciales para vendedores de empresa', () => {
    const seller = new UserEntity({
      id: '123e4567-e89b-12d3-a456-426614174003',
      email: 'ventas@ferreteria.com',
      passwordHash: 'hash',
      status: UserStatus.ACTIVA,
      type: UserType.SELLER_EMPRESA,
      profile: {
        firstName: 'Carlos',
        lastName: 'Gerente',
      },
      businessProfile: {
        legalName: 'Ferretería Central S.R.L.',
        taxId: '30-12345678-9',
        legalType: 'EMPRESA',
        reviewStatus: 'pending',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(seller.businessProfile?.legalName).toBe('Ferretería Central S.R.L.');
    expect(seller.businessProfile?.taxId).toBe('30-12345678-9');
    expect(seller.roles).toContain('seller_empresa');
  });
});
