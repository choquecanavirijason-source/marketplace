# FerroMax API (Laravel 11)

Backend API para el marketplace **FerroMax**, pensado para ser consumido por el frontend Next.js
que vive en la raíz de este repositorio. Sigue el patrón Controller delgado → Form Request →
Service → API Resource, con autenticación por token (Laravel Sanctum) y transacción con
`lockForUpdate()` al confirmar un pedido para evitar vender stock duplicado.

> **Este entorno de desarrollo no tiene PHP/Composer instalados**, así que el proyecto fue escrito
> a mano (no generado con `composer create-project`) y **no se ha podido ejecutar `composer install`,
> `php artisan migrate` ni la suite de tests aquí**. Seguí los pasos de abajo en tu máquina para
> levantarlo y verificarlo.

## 1. Requisitos

- PHP >= 8.2 con extensiones `pdo_sqlite` (o `pdo_mysql` si preferís MySQL), `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`.
- Composer 2.x.

## 2. Instalación

```bash
cd backend
composer install
copy .env.example .env        # en Windows (PowerShell: Copy-Item .env.example .env)
php artisan key:generate

# Base de datos SQLite (por defecto, cero configuración):
type nul > database\database.sqlite     # Windows
# touch database/database.sqlite        # macOS/Linux

php artisan migrate --seed
php artisan serve               # http://localhost:8000
```

Esto deja la API corriendo en `http://localhost:8000/api/v1` y crea:

- Usuario admin: `admin@ferromax.test` / `password`
- Usuario cliente: `cliente@ferromax.test` / `password`
- 8 categorías, 46 productos y 3 hero slides idénticos a los que hoy están hardcodeados en
  `src/infrastructure/data/*.data.ts` del frontend.

### Usar MySQL en vez de SQLite

Editá `.env`: comentá las líneas `DB_CONNECTION=sqlite` y descomentá el bloque `DB_CONNECTION=mysql`
con tus credenciales, luego corré `php artisan migrate --seed` de nuevo.

## 3. Conectar el frontend Next.js

En la raíz del proyecto (frontend), agregá en tu `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Los repositorios en `src/infrastructure/repositories/` (actualmente `InMemory*`) deben
reemplazarse por implementaciones HTTP que llamen a estos endpoints. Los `Resource` de Laravel
devuelven exactamente la forma de los tipos TypeScript en `src/domain/entities/` (`Product`,
`Category`, `CartItem`, `Review`, `HeroSlide`), así que el mapeo es directo.

El endpoint de login/registro devuelve `{ user, token }`; guardá el `token` y mandalo como
`Authorization: Bearer <token>` en cada request autenticada (carrito, favoritos, pedidos, panel admin).

## 4. Endpoints (`/api/v1`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/products?category=` | Público | Listado de productos, filtrable por categoría |
| GET | `/products/flash-deals` | Público | Productos en oferta |
| GET | `/products/{id}` | Público | Detalle de producto |
| GET | `/products/{id}/related` | Público | Productos relacionados (misma categoría) |
| GET | `/products/{id}/reviews` | Público | Reseñas de un producto |
| GET | `/products/{id}/reviews/summary` | Público | Promedio, total y breakdown por estrella |
| POST | `/products/{id}/reviews` | Público | Agregar reseña |
| GET | `/categories` | Público | Categorías con conteo de productos |
| GET | `/hero-slides` | Público | Banners del home |
| POST | `/auth/register` | Público | Alta de cliente → `{ user, token }` |
| POST | `/auth/login` | Público | Login → `{ user, token }` |
| POST | `/auth/logout` | Token | Revoca el token actual |
| GET | `/auth/me` | Token | Usuario autenticado |
| GET \| POST \| PATCH \| DELETE | `/cart` | Token | Carrito del usuario autenticado |
| GET \| POST \| DELETE | `/favorites` | Token | Favoritos del usuario autenticado |
| GET \| POST | `/orders` | Token | Historial de pedidos y checkout (confirma pedido, descuenta del carrito) |
| POST \| PUT \| DELETE | `/products` (mutaciones) | Token + `role=admin` | CRUD de productos desde el panel admin |
| POST | `/hero-slides` | Token + `role=admin` | Alta de banners |

## 5. Decisiones de diseño

- **Roles simples (`customer`/`admin`)** en `users.role` en vez de un paquete de permisos
  granulares: el panel admin de este proyecto solo distingue "puede gestionar productos" de
  "no puede", así que un paquete tipo Spatie sería sobre-ingeniería para el alcance actual.
- **Carrito y favoritos requieren autenticación** (a diferencia del frontend actual, que los
  guarda en `localStorage`/Zustand): así se persisten entre dispositivos y el checkout —que ya
  exige login— puede confiar en el carrito del servidor.
- **`OrderService::checkout()`** usa `DB::transaction()` + `lockForUpdate()` sobre cada producto
  para evitar vender el mismo stock a dos compradores simultáneos.
- **SQLite por defecto**: no requiere instalar ni levantar un servidor de base de datos aparte
  para probar el proyecto localmente; migrar a MySQL en producción es un cambio de `.env`.

## 6. Tests

```bash
php artisan test
```

Cubre registro/login, listado y filtrado de productos, autorización del panel admin
(`role=admin` vs cliente común) y el flujo de carrito → checkout, incluyendo el caso de
stock insuficiente (`409`) y carrito vacío (`422`).
