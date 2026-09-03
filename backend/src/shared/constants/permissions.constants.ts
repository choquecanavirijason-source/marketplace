import { UserRole } from './roles.constants';

export const Permissions = {
  PRODUCT_VIEW: 'product.view',
  PRODUCT_CREATE: 'product.create',
  PRODUCT_EDIT: 'product.edit',
  PRODUCT_DELETE: 'product.delete',

  CATEGORY_VIEW: 'category.view',
  CATEGORY_CREATE: 'category.create',
  CATEGORY_EDIT: 'category.edit',
  CATEGORY_DELETE: 'category.delete',

  ORDER_VIEW: 'order.view',
  ORDER_CREATE: 'order.create',
  ORDER_EDIT: 'order.edit',
  ORDER_CANCEL: 'order.cancel',

  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',

  KYC_SUBMIT: 'kyc.submit',
  KYC_REVIEW: 'kyc.review',

  REVIEW_VIEW: 'review.view',
  REVIEW_CREATE: 'review.create',
  REVIEW_DELETE: 'review.delete',

  METRICS_VIEW: 'metrics.view',
  METRICS_SELLER: 'metrics.seller',

  AUDIT_VIEW: 'audit.view',
  SETTINGS_EDIT: 'settings.edit',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [UserRole.BUYER]: [
    Permissions.PRODUCT_VIEW,
    Permissions.CATEGORY_VIEW,
    Permissions.ORDER_VIEW,
    Permissions.ORDER_CREATE,
    Permissions.ORDER_CANCEL,
    Permissions.REVIEW_VIEW,
    Permissions.REVIEW_CREATE,
    Permissions.KYC_SUBMIT,
  ],
  [UserRole.SELLER_INDIVIDUAL]: [
    Permissions.PRODUCT_VIEW,
    Permissions.PRODUCT_CREATE,
    Permissions.PRODUCT_EDIT,
    Permissions.CATEGORY_VIEW,
    Permissions.ORDER_VIEW,
    Permissions.ORDER_EDIT,
    Permissions.REVIEW_VIEW,
    Permissions.KYC_SUBMIT,
    Permissions.METRICS_SELLER,
  ],
  [UserRole.SELLER_COMPANY]: [
    Permissions.PRODUCT_VIEW,
    Permissions.PRODUCT_CREATE,
    Permissions.PRODUCT_EDIT,
    Permissions.CATEGORY_VIEW,
    Permissions.ORDER_VIEW,
    Permissions.ORDER_EDIT,
    Permissions.REVIEW_VIEW,
    Permissions.KYC_SUBMIT,
    Permissions.METRICS_SELLER,
  ],
  [UserRole.ADMIN]: [
    Permissions.PRODUCT_VIEW,
    Permissions.PRODUCT_CREATE,
    Permissions.PRODUCT_EDIT,
    Permissions.PRODUCT_DELETE,
    Permissions.CATEGORY_VIEW,
    Permissions.CATEGORY_CREATE,
    Permissions.CATEGORY_EDIT,
    Permissions.CATEGORY_DELETE,
    Permissions.ORDER_VIEW,
    Permissions.ORDER_EDIT,
    Permissions.ORDER_CANCEL,
    Permissions.USER_VIEW,
    Permissions.USER_CREATE,
    Permissions.USER_EDIT,
    Permissions.USER_DELETE,
    Permissions.KYC_REVIEW,
    Permissions.REVIEW_VIEW,
    Permissions.REVIEW_DELETE,
    Permissions.METRICS_VIEW,
    Permissions.AUDIT_VIEW,
  ],
  [UserRole.SUPPORT]: [
    Permissions.PRODUCT_VIEW,
    Permissions.CATEGORY_VIEW,
    Permissions.ORDER_VIEW,
    Permissions.ORDER_EDIT,
    Permissions.USER_VIEW,
    Permissions.REVIEW_VIEW,
  ],
  [UserRole.FINANCE]: [
    Permissions.ORDER_VIEW,
    Permissions.METRICS_VIEW,
    Permissions.AUDIT_VIEW,
  ],
  [UserRole.SUPERADMIN]: Object.values(Permissions) as Permission[],
};

export function getPermissionsForRole(role: string): string[] {
  const normalized = (role || '').toLowerCase();
  return (
    ROLE_PERMISSIONS[normalized] ??
    ROLE_PERMISSIONS[normalized.toUpperCase()] ??
    ROLE_PERMISSIONS[UserRole.BUYER] ??
    []
  );
}
