/**
 * Tipos de cuenta y roles según marketplace.md (Módulo 1)
 * Actores: Comprador (buyer), Vendedor (seller_individual, seller_empresa), Administrador (admin, superadmin), Soporte (support), Finanzas (finance)
 */
export enum UserType {
  BUYER = 'buyer',
  SELLER_INDIVIDUAL = 'seller_individual',
  SELLER_EMPRESA = 'seller_empresa',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  SUPPORT = 'support',
  FINANCE = 'finance',

  // Alias para retrocompatibilidad
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
