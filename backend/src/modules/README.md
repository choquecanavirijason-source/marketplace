# Modules — Monolitio Modular SimpleMarketplace360

Cada carpeta es un **módulo de dominio** con Clean Architecture + DDD de 4 capas:

```text
modules/<modulo>/
├── application/      # Commands, Queries, Handlers (casos de uso)
├── domain/           # Entities, Value Objects, Ports, Events (lógica pura)
├── infrastructure/   # Repositories Drizzle, adapters y providers concretos
└── presentation/     # Controllers Fastify + DTOs con validación Zod
```

| Módulo | Carpetas | Estado |
| :--- | :--- | :--- |
| `users/` | Módulo 1 — Usuarios, Autenticación, Roles y Onboarding | ✅ Funcional |
| `catalog/` | Módulo 2 — Catálogo, Categorías y Productos | 🚧 Scaffold |
| `search/` | Módulo 3 — Búsqueda y Discovery | 🚧 Scaffold |
| `cart/` | Módulo 4 — Carrito y Checkout | 🚧 Scaffold |
| `payments/` | Módulo 5 — Pagos y Conciliación | 🚧 Scaffold |
| `orders/` | Módulo 6 — Órdenes y Lifecycle | 🚧 Scaffold |
| `logistics/` | Módulo 7 — Logística y Envíos | 🚧 Scaffold |
| `seller/` | Módulo 8 — Panel Vendedor | 🚧 Scaffold |
| `crm/` | Módulo 9 — CRM y Automatización | 🚧 Scaffold |
| `community/` | Módulo 10 — Community Manager | 🚧 Scaffold |
| `live-shopping/` | Módulo 11 — Live Shopping | 🚧 Scaffold |
| `security/` | Módulo 12 — Seguridad y KYC/KYB | 🚧 Scaffold |
| `ai/` | Módulo 13 — Búsqueda IA y Recomendador | 🚧 Scaffold |
| `assets/` | Módulo 14 — Media Storage y Assets | 🚧 Scaffold |
| `admin/` | Módulo 15 — Backoffice y Administración | 🚧 Scaffold |

> ⚠️ **IMPORTANTE:** Un módulo scaffold NO debe importarse en `AppModule` hasta tener
> al menos un controller/provider real. Mantener módulos vacíos registrados provoca
> arranques con dependencias inexistentes.

**Regla de registro:** cuando un módulo esté listo, añadirlo al array `imports` de
`src/app.module.ts`. Los módulos cross-cutting (`DrizzleModule`, `CacheModule`) ya son
`@Global` y no requieren re-importación por cada módulo.
