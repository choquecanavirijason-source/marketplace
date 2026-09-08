import { describe, it, expect } from 'vitest';
import { UserEntity } from '../../entities/user.entity';
import { UserStatus, UserType } from '../../enums';

describe('UserEntity - Dominio Módulo 1 (marketplace.md)', () => {
  it('debe inicializar un usuario comprador con valores por defecto', () => {
    const user = new UserEntity({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'juan.perez@example.com',
      passwordHash: 'hashed_secret_password',
      status: UserStatus.ACTIVE,
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
      status: UserStatus.PENDING,
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
    expect(user.phoneVerified).toBe(true);

    user.unverifyEmail();
    expect(user.emailVerified).toBe(false);
    expect(user.calculateCompletionPct()).toBeLessThan(withPhone);

    user.unverifyPhone();
    expect(user.phoneVerified).toBe(false);
  });

  it('debe soportar transiciones de estado de cuenta y soft delete lógico', () => {
    const user = new UserEntity({
      id: '123e4567-e89b-12d3-a456-426614174002',
      email: 'test@example.com',
      passwordHash: 'hash',
      status: UserStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    user.activate();
    expect(user.status).toBe(UserStatus.ACTIVE);

    user.suspend();
    expect(user.status).toBe(UserStatus.SUSPENDED);

    user.restrict();
    expect(user.status).toBe(UserStatus.RESTRICTED);

    user.sendToReview();
    expect(user.status).toBe(UserStatus.IN_REVIEW);

    user.reject();
    expect(user.status).toBe(UserStatus.REJECTED);

    user.softDelete();
    expect(user.status).toBe(UserStatus.LOGICALLY_DELETED);
    expect(user.deletedAt).toBeInstanceOf(Date);
  });

  it('debe permitir crear perfiles comerciales para vendedores de empresa', () => {
    const seller = new UserEntity({
      id: '123e4567-e89b-12d3-a456-426614174003',
      email: 'ventas@ferreteria.com',
      passwordHash: 'hash',
      status: UserStatus.ACTIVE,
      type: UserType.SELLER_COMPANY,
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
    expect(seller.roles).toContain('seller_company');
  });
});
