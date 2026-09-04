# Marketplace — Directrices Globales de Desarrollo

Este documento define las reglas de desarrollo y estándares de ingeniería para todo el proyecto Marketplace (`backend/` y `client/`).

## 1. Reglas Generales de Ejecución
- **Procesos en Segundo Plano**: Al finalizar cualquier verificación, build o prueba, **NUNCA** dejes procesos de servidor (frontend o backend) corriendo en segundo plano. Detén siempre cualquier tarea o proceso activo antes de responder al usuario.
- **Validación Estricta**: Antes de dar por finalizada una tarea, verifica siempre la compilación estricta de TypeScript:
  - En `backend`: `npm run build`
  - En `client`: `npx tsc --noEmit` y `npm run build`

## 2. Arquitectura del Backend (`backend/`)
- **Estructura Modular**: Cada módulo en `src/modules/[nombre-modulo]/` debe implementar la siguiente estructura:
  - `controllers/`: `[nombre].controller.ts`
  - `services/`: `[nombre].service.ts` y `[nombre]-orchestrator.service.ts` (si aplica)
  - `repositories/`: `[nombre].repository.ts`
  - `entities/`: `[nombre].entity.ts`
  - `dto/`: `create-[nombre].dto.ts`, `update-[nombre].dto.ts`, `[nombre]-response.dto.ts`
  - `interfaces/`: `[nombre]-interface.ts`
  - `enums/`: `[nombre]-status.enum.ts`
  - `validators/`: `[nombre].validator.ts`
  - `events/`: `[nombre].event.ts`
  - `adapters/`: `[proveedor].adapter.ts` (para integraciones externas)
  - `tests/`: `unit/` e `integration/`
- **Capas Globales**:
  - `common/`: `decorators/`, `guards/`, `interceptors/`, `filters/`, `middlewares/`
  - `config/`: `[modulo].config.ts`
- **Validación**: Valida todas las entradas HTTP utilizando esquemas **Zod** y `ZodValidationPipe`.
- **Errores**: Emite siempre excepciones estandarizadas bajo **RFC 7807 (Problem Details)**.
- **Seguridad**: Protege rutas administrativas usando `@RequireRoles(...)` y `@RequirePermissions(...)` con sus respectivos Guards.
- **Persistencia**: Modela tablas en `src/infrastructure/database/schema/` utilizando **Drizzle ORM**.

## 3. Arquitectura del Frontend (`client/`)
- **Convención de Idioma**: 
  - **Código 100% en Inglés**: Todas las variables, funciones, componentes, tipos, interfaces, hooks y nombres de archivos de código deben estar en inglés (`useCart`, `ProductCard`, `fetchProducts`, `isLoading`).
  - **Rutas del Frontend en Inglés**: Las rutas públicas y URLs visibles en el navegador (`src/app/`) deben estar en inglés (ejemplo: `/search`, `/categories`, `/products/[id]`, `/checkout`, `/account/login`, `/admin/products`).
  - **Textos de Interfaz (UI) en Español**: Todo el texto visible para el usuario final (etiquetas, botones, mensajes de error, formularios, notificaciones toast) debe estar en español.
- **Cliente HTTP**: Toda comunicación con la API debe realizarse a través de la instancia centralizada de **Axios** en `client/src/config/axios.ts` (accesible también vía `@/config`).
- **Servicios de Datos**: Toda la comunicación con el backend se organiza directamente en `client/src/services/` (`auth.service.ts`, `user.service.ts`, `product.service.ts`, `category.service.ts`, `order.service.ts`, `cart.service.ts`, `review.service.ts`, etc.). No utilizar capas de repositorios (`domain/repositories/` o `infrastructure/repositories/`).
- **Gestión de Sesión y Cookies**: El token JWT y los datos de sesión se almacenan en **Cookies** (`ferromax-token`, `ferromax-user`, `ferromax-permissions`).
- **AuthProvider**: Toda la aplicación consume el estado de autenticación a través de `<AuthProvider />` y el hook `useAuth()`. La información del usuario se refresca automáticamente invocando `GET /api/v1/identity/me` en cada recarga.
- **React Query**: Gestiona el estado remoto utilizando `@tanstack/react-query` con invalidación automática de caché ante mutaciones.
- **Diseño UI**: Utiliza Tailwind CSS v4, componentes primitivos basados en Radix UI (`components/ui/`) y notificaciones con `sonner`.
- **Estructura de Componentes**: Los componentes residen en `components/` agrupados directamente por carpetas de dominio (`components/ui/`, `components/layout/`, `components/product/`, `components/cart/`, `components/home/`, `components/feedback/`, `components/auth/`, `components/common/`). Los hooks residen en `hooks/` y los providers en `providers/`. No utilizar la carpeta `presentation/`.
- **Uso Estricto de Arrow Functions**:
  - Utilizar **arrow functions** (`const name = (...) => { ... }`) de forma obligatoria en:
    - **Componentes**: cuando se declaran con `const` (`const MyComponent = (...) => { ... }`)
    - **Event Handlers**: funciones manejadoras de eventos (`const handleClick = (e: React.MouseEvent) => ...`)
    - **Hooks Personalizados**: todos los hooks propios (`export const useSomething = (...) => ...`)
    - **Callbacks**: callbacks pasados a hooks o componentes (`useCallback((...) => ..., [])`, `onSuccess: () => ...`)
    - **Zustand Stores**: definición del store (`create((set, get) => ({ ... }))`)
    - **Iteradores Funcionales**: llamadas a `map`, `filter`, `reduce`, `find`, `some`, `every`
    - **Utilidades y Helpers**: funciones de apoyo (`export const formatDate = (...) => ...`)
    - **Props de Children / Render Props**: `({ children }: Props) => ...`
    - **Funciones Asíncronas en Cliente**: peticiones o llamadas async (`const fetchData = async () => ...`)
    - **Proxy / Middleware**: proxy/middleware de Next.js (`export const proxy = (req: NextRequest) => ...`)
    - **Server Actions**: acciones del servidor (`export const myAction = async (...) => ...`)
    - **Metadata de Next.js**: generación dinámica de metadata (`export const generateMetadata = async (...) => ...`)

