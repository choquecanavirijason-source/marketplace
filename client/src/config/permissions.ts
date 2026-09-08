export const Permissions = {
  PRODUCT_VIEW: "product.view",
  PRODUCT_CREATE: "product.create",
  PRODUCT_EDIT: "product.edit",
  PRODUCT_DELETE: "product.delete",

  CATEGORY_VIEW: "category.view",
  CATEGORY_CREATE: "category.create",
  CATEGORY_EDIT: "category.edit",
  CATEGORY_DELETE: "category.delete",

  ORDER_VIEW: "order.view",
  ORDER_CREATE: "order.create",
  ORDER_EDIT: "order.edit",
  ORDER_CANCEL: "order.cancel",

  USER_VIEW: "user.view",
  USER_CREATE: "user.create",
  USER_EDIT: "user.edit",
  USER_DELETE: "user.delete",

  KYC_SUBMIT: "kyc.submit",
  KYC_REVIEW: "kyc.review",

  REVIEW_VIEW: "review.view",
  REVIEW_CREATE: "review.create",
  REVIEW_DELETE: "review.delete",

  METRICS_VIEW: "metrics.view",
  METRICS_SELLER: "metrics.seller",

  AUDIT_VIEW: "audit.view",
  SETTINGS_EDIT: "settings.edit",
} as const;

export type PermissionCode = (typeof Permissions)[keyof typeof Permissions] | string;

export const PERMISSION_ALIASES: Record<string, string> = {
  "producto.ver": Permissions.PRODUCT_VIEW,
  "producto.crear": Permissions.PRODUCT_CREATE,
  "producto.editar": Permissions.PRODUCT_EDIT,
  "producto.eliminar": Permissions.PRODUCT_DELETE,

  "categoria.ver": Permissions.CATEGORY_VIEW,
  "categoria.crear": Permissions.CATEGORY_CREATE,
  "categoria.editar": Permissions.CATEGORY_EDIT,
  "categoria.eliminar": Permissions.CATEGORY_DELETE,

  "pedido.ver": Permissions.ORDER_VIEW,
  "pedido.crear": Permissions.ORDER_CREATE,
  "pedido.editar": Permissions.ORDER_EDIT,
  "pedido.cancelar": Permissions.ORDER_CANCEL,

  "usuario.ver": Permissions.USER_VIEW,
  "usuario.crear": Permissions.USER_CREATE,
  "usuario.editar": Permissions.USER_EDIT,
  "usuario.eliminar": Permissions.USER_DELETE,

  "kyc.solicitar": Permissions.KYC_SUBMIT,
  "kyc.revisar": Permissions.KYC_REVIEW,

  "resena.ver": Permissions.REVIEW_VIEW,
  "resena.crear": Permissions.REVIEW_CREATE,
  "resena.eliminar": Permissions.REVIEW_DELETE,

  "metricas.ver": Permissions.METRICS_VIEW,
  "metricas.vendedor": Permissions.METRICS_SELLER,
  "auditoria.ver": Permissions.AUDIT_VIEW,
  "configuracion.editar": Permissions.SETTINGS_EDIT,

  "products.view": Permissions.PRODUCT_VIEW,
  "products.create": Permissions.PRODUCT_CREATE,
  "products.edit": Permissions.PRODUCT_EDIT,
  "products.delete": Permissions.PRODUCT_DELETE,
  "categories.view": Permissions.CATEGORY_VIEW,
  "categories.create": Permissions.CATEGORY_CREATE,
  "categories.edit": Permissions.CATEGORY_EDIT,
  "categories.delete": Permissions.CATEGORY_DELETE,
  "orders.view": Permissions.ORDER_VIEW,
  "orders.create": Permissions.ORDER_CREATE,
  "orders.edit": Permissions.ORDER_EDIT,
  "orders.cancel": Permissions.ORDER_CANCEL,
  "users.view": Permissions.USER_VIEW,
  "users.create": Permissions.USER_CREATE,
  "users.edit": Permissions.USER_EDIT,
  "users.delete": Permissions.USER_DELETE,
};

export const normalizePermission = (perm: string): string => {
  const normalized = perm.toLowerCase().trim();
  return PERMISSION_ALIASES[normalized] ?? normalized;
};
