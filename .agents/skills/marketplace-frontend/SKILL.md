---
name: marketplace-frontend
description: >-
  Guía y procedimientos para desarrollar, maquetar y extender la aplicación frontend Next.js del marketplace.
  Usa este skill cuando el usuario pida agregar nuevas pantallas, componentes de React, hooks,
  integrar endpoints con Axios, gestionar cookies de sesión, permisos o interactuar con el backend.
---

# Marketplace Frontend — Guía de Desarrollo y Procedimientos

Este skill contiene los patrones de arquitectura, estándares de diseño y flujos de trabajo para la aplicación cliente Next.js ubicada en `client/`.

## 1. Arquitectura del Frontend

El cliente Next.js 16 (App Router) implementa una estructura por capas en `client/src/`:

```text
src/
├── domain/                  # Modelos de negocio e interfaces de repositorios
│   ├── entities/            # Entidades y tipos (User, Product, Order, etc.)
│   └── repositories/        # Contratos de repositorios (AuthRepository, UserRepository, etc.)
├── application/             # Casos de uso desacoplados del framework
├── infrastructure/          # Conexión externa y adaptadores
│   ├── http/client.ts       # Cliente centralizado Axios con interceptores y RFC 7807
│   ├── repositories/        # Implementaciones HTTP de los repositorios
│   └── container.ts         # Contenedor de Inyección de Dependencias
├── presentation/            # Interfaz de usuario (Atomic Design adaptado)
│   ├── atoms/               # Primitivas UI reutilizables (Botones, Inputs, Diálogos Radix)
│   ├── molecules/           # Componentes combinados de tamaño medio
│   ├── organisms/           # Secciones complejas (Navbar, Footer, Sidebar, Layouts)
│   ├── providers/           # Context Providers globales (AuthProvider, ThemeProvider)
│   └── hooks/               # Custom hooks de React Query y estado de sesión
└── shared/                  # Utilidades compartidas
    ├── lib/cookies.ts       # Gestor de cookies seguras (SameSite=Lax, 7 días)
    └── lib/marketplaceStorage.ts # Sincronización entre cookies y localStorage
```

## 2. Comandos Operativos Clave

Ejecutar siempre desde el directorio `client/`:

| Tarea | Comando | Descripción |
| :--- | :--- | :--- |
| **Verificación de Tipos** | `npx tsc --noEmit` | Valida TypeScript sin generar artefactos. |
| **Compilación de Producción** | `npm run build` | Construye páginas estáticas y rutas SSR con Next.js. |
| **Linting** | `npm run lint` | Análisis estático con ESLint. |

## 3. Patrones y Estándares de Integración

### Cliente HTTP con Axios (`client.ts`)
- Toda llamada HTTP se realiza a través de `apiRequest<T>()` o `apiClient`.
- Inyecta automáticamente el token JWT desde las cookies (`Authorization: Bearer <token>`).
- Maneja automáticamente los códigos `401 Unauthorized` limpiando las cookies con `logoutCustomer()`.
- Parsea errores bajo el estándar RFC 7807 (`error.detail` o `error.message`).

### Autenticación y Permisos (`useAuth`)
- El estado de autenticación se administra globalmente mediante `<AuthProvider />` en `app/providers.tsx`.
- En cada recarga o navegación, recupera automáticamente el usuario fresco invocando `GET /api/v1/identity/me`.
- Uso en cualquier componente:
```tsx
import { useAuth } from "@/presentation/hooks/useAuth";

export function MiVista() {
  const { user, isAdmin, hasPermission, hasRole } = useAuth();

  if (hasPermission("producto.crear")) {
    return <BotonCrearProducto />;
  }
}
```

### Consultas y Mutaciones con TanStack React Query
- Utilizar `useQuery` para operaciones de lectura con cacheo inteligente.
- Utilizar `useMutation` para creación, actualización y eliminación, invalidando la clave correspondiente en `onSuccess`:
```tsx
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
```

### Notificaciones al Usuario
- Usar `toast` de la librería `sonner` para feedback visual inmediato:
```tsx
import { toast } from "sonner";
toast.success("Operación realizada con éxito");
toast.error("Error al procesar la solicitud");
```

## 4. Procedimiento para Crear una Nueva Pantalla

1. **Definir la Entidad y Contrato**: En `src/domain/entities/<Entidad>.ts` y `src/domain/repositories/<Entidad>Repository.ts`.
2. **Implementar Repositorio HTTP**: En `src/infrastructure/repositories/Http<Entidad>Repository.ts` usando `apiRequest`.
3. **Registrar en Contenedor**: Instanciar en `src/infrastructure/container.ts`.
4. **Crear Custom Hooks**: En `src/presentation/hooks/use<Entidad>.ts` con React Query.
5. **Crear la Página Next.js**: En `src/app/<ruta>/page.tsx` reutilizando componentes de `presentation/atoms/` y layouts de `presentation/organisms/`.
6. **Verificar Compilación**: Ejecutar `npx tsc --noEmit` y `npm run build`.
