import { faker } from '@faker-js/faker';
import * as crypto from 'crypto';
import { UserType, UserStatus } from '../../shared';

export interface StaticAccount {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  type: UserType;
  status: UserStatus;
  roles: string[];
  legalName?: string;
  tradeName?: string;
  taxId?: string;
}

export const STATIC_ACCOUNTS: StaticAccount[] = [
  {
    email: 'admin@marketplace.com',
    firstName: 'Admin',
    lastName: 'System',
    phone: '+10000000001',
    type: UserType.SUPERADMIN,
    status: UserStatus.ACTIVE,
    roles: ['superadmin', 'admin'],
  },
  {
    email: 'staff@marketplace.com',
    firstName: 'Staff',
    lastName: 'Moderator',
    phone: '+10000000002',
    type: UserType.SUPPORT,
    status: UserStatus.ACTIVE,
    roles: ['support', 'admin'],
  },
  {
    email: 'seller@marketplace.com',
    firstName: 'Comercial',
    lastName: 'Ventas',
    phone: '+10000000003',
    type: UserType.SELLER_COMPANY,
    status: UserStatus.ACTIVE,
    roles: ['seller_company', 'seller_empresa', 'seller'],
    legalName: 'Ferretería Industrial S.A.',
    tradeName: 'Ferromax Comercial',
    taxId: '30-71234567-8',
  },
  {
    email: 'buyer@marketplace.com',
    firstName: 'Cliente',
    lastName: 'Frecuente',
    phone: '+10000000004',
    type: UserType.BUYER,
    status: UserStatus.ACTIVE,
    roles: ['buyer'],
  },
];

export interface FakeUserRecord {
  id: string;
  email: string;
  phone: string;
  passwordHash: string;
  status: UserStatus;
  type: UserType;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export function generateFakeUsers(count: number, defaultPasswordHash: string): FakeUserRecord[] {
  const users: FakeUserRecord[] = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < count; i++) {
    let email = faker.internet.email().toLowerCase();
    while (usedEmails.has(email)) {
      email = `${i}_${faker.internet.email().toLowerCase()}`;
    }
    usedEmails.add(email);

    const rand = Math.random();
    let type = UserType.BUYER;
    if (rand > 0.98) {
      type = UserType.ADMIN;
    } else if (rand > 0.75) {
      type = UserType.SELLER_INDIVIDUAL;
    }

    const randStatus = Math.random();
    let status = UserStatus.ACTIVE;
    if (randStatus > 0.97) {
      status = UserStatus.SUSPENDED;
    } else if (randStatus > 0.85) {
      status = UserStatus.PENDING;
    }

    const createdAt = faker.date.past({ years: 1 });
    const isVerified = status === UserStatus.ACTIVE;

    users.push({
      id: crypto.randomUUID(),
      email,
      phone: `+${faker.string.numeric({ length: 11 })}`,
      passwordHash: defaultPasswordHash,
      status,
      type,
      emailVerifiedAt: isVerified ? createdAt : null,
      phoneVerifiedAt: isVerified ? createdAt : null,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      createdAt,
      updatedAt: new Date(),
    });
  }

  return users;
}
