# Módulo 12 — Seguridad y KYC/KYB

> Referencia: marketplace.md §14

## Propósito

KYC/KYB multi-proveedor (Onfido/Sumsub/DIDIT), 2FA, motor de riesgo, listas de bloqueo, cases y auditoría de seguridad.

## Capas (Clean Architecture)

- **application/** — Commands, Queries y Handlers de los casos de uso.
- **domain/** — Entities, Value Objects, Ports (repositorios/proveedores) y Events de dominio.
- **infrastructure/** — Repositories Drizzle, adapters de proveedores externos y providers.
- **presentation/** — Controllers HTTP + DTOs validados con Zod.

## Modelo de datos tentativo (Drizzle en src/infrastructure/database/schema/)

$tables

## Estado

🚧 **Scaffold** — Sin implementación todavía. No importar en AppModule hasta tener
al menos un controller/provider real.

## Pasos para implementar

1. Definir esquemas Drizzle en src/infrastructure/database/schema/ y exportarlos en schema/index.ts.
2. Crear entidades/value objects/ports en domain/.
3. Implementar repositories (Drizzle) y adapters en infrastructure/.
4. Crear handlers + commands/queries en pplication/.
5. Definir DTOs Zod y el controller en presentation/.
6. Registrar el módulo en src/app.module.ts.
7. Verificar 
pm run build y 
pm test.
