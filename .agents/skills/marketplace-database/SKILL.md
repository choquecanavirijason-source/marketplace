---
name: marketplace-database
description: >-
  Guía y procedimientos para administrar la base de datos PostgreSQL, esquemas Drizzle ORM,
  migraciones, seeders con Faker y auditoría de datos del marketplace.
  Usa este skill cuando el usuario pida modificar esquemas de tablas, ejecutar migraciones,
  sembrar datos de prueba (seeds), consultar registros de auditoría o conectar Redis/Postgres.
---

# Marketplace Database — Guía de Base de Datos y Seeders

Este skill contiene los procedimientos para gestionar la capa de persistencia PostgreSQL y Drizzle ORM del marketplace.

## 1. Conexión e Infraestructura

- **Motor**: PostgreSQL 16
- **Base de Datos por defecto**: `marketplace` (según `DATABASE_URL` en `backend/.env` y defaults de `src/config/env-schema.ts`)
- **Cadena de Conexión por defecto (`DATABASE_URL`)**:
  `postgres://postgres:postgres@localhost:5432/marketplace`
- **Caché / Sesiones**: Redis 7 en `localhost:6379` (con modo degradado resiliente si no está activo).
- **Almacenamiento S3 / R2 / MinIO**: `http://localhost:9000` (bucket: `marketplace-documents`).
  ⚠️ La infraestructura de storage/queue está **archivada** en `backend/legacy/infrastructure/` y se
  reactiva cuando los Módulos 5/7/14 la requieran.

## 2. Tablas Principales del Esquema

Todos los esquemas viven en `backend/src/infrastructure/database/schema/` y se exportan desde `schema/index.ts`.
Convención de nombres: cada tabla exporta `xxxTable` + tipos `XxxDb` / `NewXxxDb`.

| Tabla | Constante / Archivo Esquema | Descripción |
| :--- | :--- | :--- |
| **`users`** | `usersTable` — `users.schema.ts` | Cuentas, roles (`SUPERADMIN`, `ADMIN`, `SELLER`, `BUYER`), estados (`PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `BANNED`), `kycLevel`. |
| **`sessions`** | `sessionsTable` — `sessions.schema.ts` | Refresh tokens hasheados (SHA-256), rotación, expiración y control de sesiones. |
| **`verifications`** | `verificationsTable` — `kyc.schema.ts` | Solicitudes de verificación de identidad KYC y estados de aprobación. |
| **`documents`** | `documentsTable` — `kyc.schema.ts` | Metadatos de archivos probatorios subidos a S3 (DNI, constancia fiscal, etc.). |
| **`audit_logs`** | `auditLogsTable` — `audit-logs.schema.ts` | Trazabilidad inmutable de eventos críticos de seguridad (logins, fallos, revocaciones). |

> Nota: las tablas KYC (`verifications`, `documents`) pertenecen al **Módulo 12 (Seguridad)**.
> El código de aplicación archivado está en `backend/legacy/modules/verification/`. El seeder
> continúa sembrando verificaciones aprobadas para usuarios con `kycLevel > 0`.

## 3. Comandos de Drizzle ORM y Seeders

Ejecutar siempre desde la carpeta `backend/`:

```bash
# Sincronizar cambios de esquema directamente con la base de datos:
npm run db:push

# Generar archivo SQL de migración versionado en src/infrastructure/database/migrations:
npm run db:generate

# Sembrar datos de prueba con Faker:
npm run db:seed
```

### Contenido del Seeder (`npm run db:seed`)
El seeder ubicado en `backend/src/seeds/` genera automáticamente:
- **Cuentas fijas para desarrollo** (`backend/src/seeds/fixtures/users.fixture.ts`):
  - `admin@marketplace.com` / `Password1234!` (Rol: `SUPERADMIN`, KYC: `ENTERPRISE`)
  - `staff@marketplace.com` / `Password1234!` (Rol: `ADMIN`, KYC: `VERIFIED`)
  - `seller@marketplace.com` / `Password1234!` (Rol: `SELLER`, KYC: `VERIFIED`)
  - `buyer@marketplace.com` / `Password1234!` (Rol: `BUYER`, KYC: `BASIC`)
- **Usuarios generados con Faker**: ~75% compradores, 23% vendedores, 2% admins; estados ACTIVE/PENDING/SUSPENDED.
  Inserción en lotes de 200 con `onConflictDoNothing`.
- **Registros KYC y documentos** para usuarios con `kycLevel > 0` (estado `APPROVED`, provider `ONFIDO_SANDBOX`).
- **Audit log** inicial `SYSTEM_DATABASE_SEEDED`.

## 4. Auditoría de Seguridad

Cada inicio de sesión, cambio de rol o cierre de sesión genera un registro en `audit_logs` con:
- `userId`: Identificador del usuario o `null` si no existe.
- `eventType`: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `TOKEN_REUSE_DETECTED`, `SYSTEM_DATABASE_SEEDED`, etc.
- `ipAddress`: Dirección IP del cliente.
- `userAgent`: Navegador o dispositivo.
- `correlationId`: ID de trazabilidad transversal para observabilidad distribuida.
