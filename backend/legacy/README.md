# legacy/ — Código Archivado (referencia, NO compilado)

Esta carpeta **no forma parte del build** de `src/` (excluida por `tsconfig.build.json`,
`vitest.config.mts` y `nest build`). Contiene implementaciones previas que fueron retiradas
del monolitio modular al consolidar la arquitectura según `backend/marketplace.md`.

## Contenido

| Carpeta | Origen | Destino futuro |
| :--- | :--- | :--- |
| `modules/notifications/` | Módulo independiente de OTP/email/WhatsApp | Procesadores de cola / infraestructura transversal (`src/infrastructure/queue`) |
| `modules/verification/` | Módulo independiente de KYC con webhooks | **Módulo 12 (`src/modules/security/`)** |
| `infrastructure/storage/` | Servicio S3/R2/MinIO presigned URLs | Reactivar en **Módulo 14 (`assets/`)** |
| `infrastructure/queue/` | Wrapper BullMQ | Reactivar para jobs asíncronos |

## Reglas

1. **NO** se debe importar nada desde `legacy/` en `src/`.
2. Su propósito es servir de **referencia de implementación** al reconstruir cada capacidad
   dentro de su módulo objetivo del monolitio.
3. El código puede tener imports relativos rotos (apuntaban a los módulos `identity/`, `auth/`,
   `storage/`, `queue/` antiguos) porque **no se compila**.
4. Cuando una capacidad se reconstruya en `src/`, la copia en `legacy/` puede eliminarse.
