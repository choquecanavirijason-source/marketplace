export enum UserType {
  BUYER = 'buyer',
  SELLER_INDIVIDUAL = 'seller_individual',
  SELLER_COMPANY = 'seller_company',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  SUPPORT = 'support',
  FINANCE = 'finance',
  SELLER = 'seller',
}

export const UserRole = UserType;
export type UserRole = UserType;

export enum KycLevel {
  NONE = 0,
  BASIC = 1,
  VERIFIED = 2,
  ENTERPRISE = 3,
}
