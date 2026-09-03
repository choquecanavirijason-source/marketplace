---
name: marketplace-backend
description: >-
  Guía y procedimientos para desarrollar, probar y extender el backend NestJS del marketplace.
  Usa este skill cuando el usuario pida agregar nuevos módulos de negocio, controladores, casos de uso,
  migraciones de base de datos con Drizzle ORM, tareas en segundo plano o pruebas unitarias con Vitest.
---

# Marketplace Backend — Guía de Desarrollo y Procedimientos

Este skill contiene los patrones de arquitectura, estándares y procedimientos para operar y evolucionar el backend NestJS Enterprise ubicado en `backend/`.

## 1. Arquitectura del Backend

El backend sigue los principios de **Clean Architecture y Domain-Driven Design (DDD)** modularizado en `backend/src/modules/`. Es un **monolitio modular** de 15 módulos de negocio definidos en `backend/marketplace.md`:

```text
src/modules/
├── users/            # ✅ Módulo 1 — Usuarios, Auth, Roles y Onboarding (FUNCIONAL)
├── catalog/          # 🚧 Módulo 2 — Catálogo, Categorías y Productos
├── search/           # 🚧 Módulo 3 — Búsqueda y Discovery
├── cart/             # 🚧 Módulo 4 — Carrito y Checkout
├── payments/         # 🚧 Módulo 5 — Pagos y Conciliación
├── orders/           # 🚧 Módulo 6 — Órdenes y Lifecycle
├── logistics/        # 🚧 Módulo 7 — Logística y Envíos
├── seller/           # 🚧 Módulo 8 — Panel Vendedor
├── crm/              # 🚧 Módulo 9 — CRM y Automatización
├── community/        # 🚧 Módulo 10 — Community Manager
├── live-shopping/    # 🚧 Módulo 11 — Live Shopping
├── security/         # 🚧 Módulo 12 — Seguridad y KYC/KYB
├── ai/               # 🚧 Módulo 13 — Búsqueda IA y Recomendador
├── assets/           # 🚧 Módulo 14 — Media Storage y Assets
└── admin/            # 🚧 Módulo 15 — Backoffice y Administración
```

Cada módulo usa la siguiente estructura interna:

```text
src/modules/<modulo>/
├── controllers/
│   └── <nombre>.controller.ts
├── services/
│   ├── <nombre>.service.ts
│   └── <nombre>-orchestrator.service.ts (si aplica)
├── repositories/
│   └── <nombre>.repository.ts
├── entities/
│   └── <nombre>.entity.ts
├── dto/
│   ├── create-<nombre>.dto.ts
│   ├── update-<nombre>.dto.ts
│   └── <nombre>-response.dto.ts
├── interfaces/
│   └── <nombre>-interface.ts
├── enums/
│   └── <nombre>-status.enum.ts
├── validators/
│   └── <nombre>.validator.ts
├── events/
│   └── <nombre>.event.ts
├── adapters/
│   └── <proveedor>.adapter.ts (para integraciones externas)
└── tests/
    ├── unit/
    └── integration/
```

### Estado de los módulos

- **`users/` es el ÚNICO módulo funcional** (Módulo 1): registro, login, refresh token rotativo,
  logout, sesiones, `/me` y CRUD administrativo de usuarios (RBAC).
- Los módulos 2–15 son **scaffolds** (carpetas `application/domain/infrastructure/presentation`
  con `.gitkeep` y `README.md`). **NO deben importarse en `AppModule`** hasta tener código real.

### Código archivado (`backend/legacy/`)

La carpeta `backend/legacy/` guarda código fuera de `src/` (no se compila ni se importa):
- `modules/verification/` (KYC) → reimplementar dentro del **Módulo 12 (`security/`)**.
- `modules/notifications/` (OTP/email/WhatsApp) → reimplementar como procesadores de cola/infra.
- `infrastructure/storage/` y `infrastructure/queue/` → reactivar cuando Módulos 5/7/14 los requieran.

Consultar ese directorio como referencia antes de reconstruir dichas capacidades.

## 2. Comandos Operativos Clave

Ejecutar siempre desde el directorio `backend/`:

| Tarea | Comando | Descripción |
| :--- | :--- | :--- |
| **Compilar** | `npm run build` | Compila TypeScript con Nest CLI y valida tipos. |
| **Pruebas Unitarias** | `npm test` | Ejecuta la suite de pruebas unitarias con Vitest. |
| **Pruebas con Cobertura** | `npm run test:cov` | Reporte de cobertura de pruebas con Vitest. |
| **Sembrado de Datos** | `npm run db:seed` | Siembra cuentas admin + usuarios Faker y registros KYC. |
| **Sincronizar Esquema** | `npm run db:push` | Aplica cambios del esquema Drizzle directamente a Postgres. |
| **Generar Migraciones** | `npm run db:generate` | Crea archivos SQL de migración en `src/infrastructure/database/migrations/`. |

## 3. Convenciones y Estándares

### Manejo de Errores (RFC 7807)
Todo error HTTP emitido debe adherirse al estándar Problem Details usando las excepciones de `src/shared`:

```typescript
import {
  DomainException,
  DuplicateEntityException,
  EntityNotFoundException,
  InvalidStateTransitionException,
  UnauthorizedException,
  ForbiddenException,
} from '../../../shared';

// Conflicto (409):
throw new DuplicateEntityException('Usuario', 'email', 'correo@example.com');
// No encontrado (404):
throw new EntityNotFoundException('Usuario', id);
// Regla de dominio (400):
throw new DomainException('El estado no permite esta operación.');
```

> ⚠️ Las excepciones de `shared` (`UnauthorizedException`, `ForbiddenException`, etc.) tienen
> códigos propios y sombrean a las homónimas de `@nestjs/common`. Importar siempre desde `shared`
> cuando se quiera emitir Problem Details completo; el filter global las serializa.

### Seguridad y Control de Acceso (RBAC)
- **Rutas Públicas**: Usar el decorador `@Public()`.
- **Rutas Protegidas**: Usar `@UseGuards(JwtAuthGuard)`.
- **Restricción por Rol**: `@UseGuards(JwtAuthGuard, RolesGuard)` acompañado de `@RequireRoles(UserRole.ADMIN, UserRole.SUPERADMIN)`.
- **Restricción por Permiso**: `@RequirePermissions('producto.crear')` con `PermissionsGuard` (SUPERADMIN tiene bypass).

### Validación con Zod
- Todos los DTOs se definen con Zod en `src/modules/<modulo>/presentation/dto/`.
- Aplicar el pipe en el controlador: `@UsePipes(new ZodValidationPipe(miSchema))` o `@Body(new ZodValidationPipe(schema))`.

### Endpoints públicos del Módulo 1 (compatibles con el frontend)
El frontend consume rutas bajo doble prefijo (controladores con `@Controller(['identity', ''])` y
`@Controller(['auth', ''])`), por lo que cada endpoint responde tanto con su prefijo como en la raíz:

| Método | Endpoint | Seguridad | Uso |
| :--- | :--- | :--- | :--- |
| `POST` | `/identity/register` (y `/register`) | `@Public()` | Registro de usuario |
| `GET` | `/identity/me` (y `/me`) | `JwtAuthGuard` | Perfil actual + permisos |
| `GET/POST/PATCH/DELETE` | `/identity/users...` | `JwtAuthGuard + RolesGuard` (ADMIN) | CRUD admin de usuarios |
| `POST` | `/auth/login` (y `/login`) | `@Public()` | Login con credenciales |
| `POST` | `/auth/refresh` (y `/refresh`) | `@Public()` | Rotación de refresh token |
| `POST` | `/auth/logout` (y `/logout`) | `JwtAuthGuard` | Cierre de sesión |

## 4. Procedimiento para Crear un Nuevo Módulo (o reactivar un scaffold)

1. **Definir la Tabla Drizzle**: Crear el esquema en `src/infrastructure/database/schema/<entidad>.schema.ts` y exportarlo en `schema/index.ts`.
2. **Crear Entidad de Dominio**: En `src/modules/<modulo>/domain/entities/<entidad>.entity.ts`.
3. **Declarar el Puerto del Repositorio**: En `src/modules/<modulo>/domain/ports/<entidad>-repository.port.ts`.
4. **Implementar el Repositorio Postgres**: En `src/modules/<modulo>/infrastructure/repositories/postgres-<entidad>.repository.ts`.
5. **Crear Casos de Uso (Commands/Queries y Handlers)**: En `src/modules/<modulo>/application/`.
6. **Definir DTOs con Zod**: En `src/modules/<modulo>/presentation/dto/`.
7. **Crear el Controlador**: En `src/modules/<modulo>/presentation/<modulo>.controller.ts`.
8. **Configurar el Módulo Nest**: Conectar proveedores y controladores en `<modulo>.module.ts` e importarlo en `src/app.module.ts`.
9. **Verificar Compilación y Tests**: Ejecutar `npm run build` y `npm test`.

> Regla: un scaffold de módulo 2–15 no debe registrarse en `AppModule` mientras esté vacío.
> `UsersModule`, `DrizzleModule` y `CacheModule` son `@Global`, por lo que sus puertos/servicios
> se consumen sin re-importar el módulo.

## 5. Referencias clave

- Documento maestro de arquitectura: `backend/marketplace.md`
- Infraestructura global: `src/infrastructure/database` (Drizzle) y `src/infrastructure/cache` (Redis con degradación).
- Cross-cutting: `src/common/` (guards, decoradores, filters, interceptors, pipes) y `src/shared/` (constantes, excepciones, tipos, utils).
