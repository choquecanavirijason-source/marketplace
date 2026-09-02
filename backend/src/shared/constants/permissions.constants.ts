import { UserRole } from './roles.constants';

export const Permissions = {
  // Productos
  PRODUCT_VIEW: 'producto.ver',
  PRODUCT_CREATE: 'producto.crear',
  PRODUCT_EDIT: 'producto.editar',
  PRODUCT_DELETE: 'producto.eliminar',

  // Categorías
  CATEGORY_VIEW: 'categoria.ver',
  CATEGORY_CREATE: 'categoria.crear',
  CATEGORY_EDIT: 'categoria.editar',
  CATEGORY_DELETE: 'categoria.eliminar',

  // Pedidos
  ORDER_VIEW: 'pedido.ver',
  ORDER_CREATE: 'pedido.crear',
  ORDER_EDIT: 'pedido.editar',
  ORDER_CANCEL: 'pedido.cancelar',

  // Usuarios
  USER_VIEW: 'usuario.ver',
  USER_EDIT: 'usuario.editar',
  USER_DELETE: 'usuario.eliminar',

  // KYC
  KYC_SUBMIT: 'kyc.solicitar',
  KYC_REVIEW: 'kyc.revisar',

  // Reseñas
  REVIEW_VIEW: 'resena.ver',
  REVIEW_CREATE: 'resena.crear',
  REVIEW_DELETE: 'resena.eliminar',

  // Métricas
  METRICS_VIEW: 'metricas.ver',
  METRICS_SELLER: 'metricas.vendedor',

  // Configuración / Auditoría
  AUDIT_VIEW: 'auditoria.ver',
  SETTINGS_EDIT: 'configuracion.editar',
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
  [UserRole.SELLER_EMPRESA]: [
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
    Permissions.USER_EDIT,
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
