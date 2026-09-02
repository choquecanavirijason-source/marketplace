# Módulo 7 — Logística y Envíos

> Referencia: marketplace.md §9

## Propósito

Fulfillment end-to-end: promesas de entrega, carriers (Correos, Andes), etiquetas, tracking, SLA y POD.

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
