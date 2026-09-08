import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bot,
  Building2,
  Contact,
  CreditCard,
  Gift,
  Heart,
  KeyRound,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Radio,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Tags,
  TrendingUp,
  Truck,
  User,
  Users,
} from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string | string[];
  roles?: string[];
  badge?: string;
  category?: string;
  children?: DashboardNavItem[];
  exact?: boolean;
}

export const adminNavItems: DashboardNavItem[] = [
  {
    href: "/admin",
    label: "Panel General",
    icon: LayoutDashboard,
    children: [
      {
        href: "/admin",
        label: "Resumen General",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/admin/orders",
        label: "Pedidos y Ventas",
        icon: ShoppingBag,
        permission: "pedido.ver",
        roles: ["admin", "superadmin", "support"],
      },
      {
        href: "/admin/logistics",
        label: "Logística y Envíos",
        icon: Truck,
        permission: "logistica.ver",
        roles: ["admin", "superadmin", "support"],
      },
      {
        href: "/admin/products",
        label: "Productos",
        icon: Package,
        permission: "producto.ver",
        roles: ["admin", "superadmin"],
      },
      {
        href: "/admin/categories",
        label: "Categorías",
        icon: Tags,
        permission: "categoria.ver",
        roles: ["admin", "superadmin"],
      },
    ],
  },
  {
    href: "/admin/crm",
    label: "Clientes & Canales",
    icon: Contact,
    children: [
      {
        href: "/admin/crm",
        label: "CRM & Clientes",
        icon: Contact,
        permission: "crm.ver",
        roles: ["admin", "superadmin"],
      },
      {
        href: "/admin/inbox",
        label: "Bandeja Omnicanal",
        icon: MessageSquare,
        permission: "inbox.ver",
        roles: ["admin", "superadmin", "support"],
      },
      {
        href: "/admin/live-shopping",
        label: "Live Shopping",
        icon: Radio,
        permission: "live.ver",
        roles: ["admin", "superadmin"],
        badge: "En Vivo",
      },
    ],
  },
  {
    href: "/admin/metrics",
    label: "Analítica & Control",
    icon: TrendingUp,
    children: [
      {
        href: "/admin/ai-copilot",
        label: "IA & Recomendaciones",
        icon: Bot,
        permission: "ai.ver",
        roles: ["admin", "superadmin"],
        badge: "IA",
      },
      {
        href: "/admin/metrics",
        label: "Métricas y Reportes",
        icon: TrendingUp,
        permission: "metricas.ver",
        roles: ["admin", "superadmin", "finance"],
      },
      {
        href: "/admin/users",
        label: "Gestión de Usuarios",
        icon: Users,
        permission: "usuario.ver",
        roles: ["admin", "superadmin", "support"],
      },
    ],
  },
  {
    href: "/admin/settings",
    label: "Configuración",
    icon: Settings,
    children: [
      {
        href: "/admin/settings",
        label: "Configuración General",
        icon: Settings,
        roles: ["admin", "superadmin"],
      },
      {
        href: "/admin/auth-settings",
        label: "Métodos de Acceso",
        icon: KeyRound,
        roles: ["admin", "superadmin"],
        badge: "Nuevo",
      },
    ],
  },
  {
    href: "/account/dashboard",
    label: "Mi Perfil",
    icon: User,
    children: [
      {
        href: "/account/dashboard",
        label: "Resumen de Cuenta",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/account/orders",
        label: "Mis Pedidos",
        icon: ShoppingBag,
      },
      {
        href: "/account/favorites",
        label: "Mis Favoritos",
        icon: Heart,
      },
      {
        href: "/account/addresses",
        label: "Mis Direcciones",
        icon: MapPin,
      },
      {
        href: "/account/profile",
        label: "Mi Perfil",
        icon: User,
        exact: true,
      },
      {
        href: "/account/profile/security",
        label: "Seguridad",
        icon: ShieldCheck,
      },
    ],
  },
];

export const customerNavItems: DashboardNavItem[] = [
  {
    href: "/account/dashboard",
    label: "Mi Cuenta",
    icon: LayoutDashboard,
    exact: true,
    children: [
      {
        href: "/account/dashboard",
        label: "Resumen de Cuenta",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/account/orders",
        label: "Mis Pedidos",
        icon: ShoppingBag,
      },
      {
        href: "/account/favorites",
        label: "Mis Favoritos",
        icon: Heart,
      },
      {
        href: "/account/addresses",
        label: "Mis Direcciones",
        icon: MapPin,
      },
      {
        href: "/account/wishlist",
        label: "Lista de Deseos",
        icon: Gift,
      },
      {
        href: "/account/reviews",
        label: "Mis Reseñas",
        icon: Star,
      },
    ],
  },
  {
    href: "/account/profile",
    label: "Perfil & Seguridad",
    icon: User,
    children: [
      {
        href: "/account/profile",
        label: "Mi Perfil",
        icon: User,
        exact: true,
      },
      {
        href: "/account/profile/security",
        label: "Seguridad",
        icon: ShieldCheck,
      },
      {
        href: "/account/profile/preferences",
        label: "Preferencias",
        icon: Settings,
      },
    ],
  },
  {
    href: "/account/payments",
    label: "Pagos & Suscripciones",
    icon: CreditCard,
    children: [
      {
        href: "/account/payments",
        label: "Métodos de Pago",
        icon: CreditCard,
        exact: true,
      },
      {
        href: "/account/subscriptions",
        label: "Suscripciones",
        icon: Award,
      },
      {
        href: "/account/invoices",
        label: "Facturas",
        icon: Receipt,
      },
    ],
  },
];

export const sellerNavItems: DashboardNavItem[] = [
  {
    href: "/seller/dashboard",
    label: "Mi Negocio",
    icon: LayoutDashboard,
    children: [
      {
        href: "/seller/dashboard",
        label: "Panel de Ventas",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/seller/products",
        label: "Mis Productos",
        icon: Package,
      },
      {
        href: "/seller/store",
        label: "Mi Tienda",
        icon: Store,
      },
    ],
  },
  {
    href: "/account/dashboard",
    label: "Mi Cuenta",
    icon: User,
    children: [
      {
        href: "/account/dashboard",
        label: "Resumen de Compras",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/account/orders",
        label: "Mis Compras",
        icon: ShoppingBag,
      },
      {
        href: "/account/favorites",
        label: "Mis Favoritos",
        icon: Heart,
      },
      {
        href: "/account/profile",
        label: "Mi Perfil Personal",
        icon: User,
      },
    ],
  },
];

export const companyNavItems: DashboardNavItem[] = [
  {
    href: "/account/company",
    label: "Datos Corporativos",
    icon: Building2,
    children: [
      {
        href: "/account/company",
        label: "Perfil Fiscal & CUIT",
        icon: Building2,
        exact: true,
      },
      {
        href: "/account/orders",
        label: "Compras B2B",
        icon: ShoppingBag,
      },
      {
        href: "/account/addresses",
        label: "Direcciones Fiscales",
        icon: MapPin,
      },
    ],
  },
  {
    href: "/account/dashboard",
    label: "Mi Cuenta",
    icon: User,
    children: [
      {
        href: "/account/dashboard",
        label: "Resumen Personal",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/account/profile",
        label: "Mi Perfil",
        icon: User,
      },
    ],
  },
];
