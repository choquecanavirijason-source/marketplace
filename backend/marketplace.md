# 🏗️ Arquitectura de Producción y Mejores Prácticas
## NestJS Enterprise Stack para Marketplace

- **Versión:** 2.0.0
- **Última actualización:** 2026-09-02
- **Mantenedor:** Equipo de Arquitectura

---

## 📋 Tabla de Contenidos
1. [Principios Arquitectónicos](#1-principios-arquitectónicos)
2. [Estructura de Directorios](#2-estructura-de-directorios)
3. [Módulos de Dominio](#3-módulos-de-dominio)
4. [Infraestructura y Servicios](#4-infraestructura-y-servicios)
5. [Patrones de Diseño Implementados](#5-patrones-de-diseño-implementados)
6. [Seguridad y Resiliencia](#6-seguridad-y-resiliencia)
7. [Estrategia de Base de Datos](#7-estrategia-de-base-de-datos)
8. [Manejo de Errores y Logging](#8-manejo-de-errores-y-logging)
9. [Pruebas y Calidad](#9-pruebas-y-calidad)
10. [Checklist de Producción](#10-checklist-de-producción)
11. [Resumen Ejecutivo](#11-resumen-ejecutivo)

---

## 1. Principios Arquitectónicos

### 1.1. Principios Fundamentales

| Principio | Aplicación en el Proyecto |
| :--- | :--- |
| **SOLID** | Cada módulo sigue los 5 principios: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. |
| **Clean Architecture** | Las capas están organizadas por dependencias: Dominio → Aplicación → Infraestructura. Las reglas de negocio NO dependen de frameworks. |
| **Domain-Driven Design (DDD)** | Cada módulo de negocio (Auth, Identity, Verification, Notifications) es un Bounded Context con su propio lenguaje ubicuo. |
| **Hexagonal Architecture (Ports & Adapters)** | Los adaptadores externos (KYC, Email, Storage) se conectan mediante puertos definidos en el dominio. |
| **CQRS (Command Query Responsibility Segregation)** | Separación clara entre operaciones de escritura (Commands) y lectura (Queries). |
| **Event-Driven Architecture** | Eventos de dominio (`UserRegistered`, `KycApproved`, `DocumentUploaded`) disparan procesos asíncronos. |

### 1.2. Capas de Arquitectura (Orden de Dependencia)

```text
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION                      │
│          (Controllers, DTOs, Guards)                │
│              Depende de →                           │
├─────────────────────────────────────────────────────┤
│                   APPLICATION                       │
│          (Services, Use Cases, Handlers)            │
│              Depende de →                           │
├─────────────────────────────────────────────────────┤
│                     DOMAIN                          │
│   (Entities, Value Objects, Domain Events,          │
│    Repository Interfaces, Ports)                    │
│              Depende de →                           │
├─────────────────────────────────────────────────────┤
│                INFRASTRUCTURE                       │
│   (Repositories, Adapters, Queues, Storage)        │
│              Depende de →                           │
├─────────────────────────────────────────────────────┤
│               SHARED / COMMON                       │
│   (Constants, Utils, Shared Types)                 │
└─────────────────────────────────────────────────────┘
```

### 1.3. Decisiones Clave de Diseño

| Decisión | Justificación |
| :--- | :--- |
| **Modular Monolith** | Evita complejidad de microservicios en etapas tempranas, pero permite desacoplamiento gradual si crece. |
| **Drizzle ORM** | Type-Safe nativo, mejor rendimiento que TypeORM, soporte nativo para migraciones rápidas y SQL directo. |
| **Zod + OpenAPI** | Validación en runtime y documentación autogenerada desde los mismos esquemas tipados. |
| **BullMQ + Redis** | Procesamiento asíncrono robusto con reintentos exponenciales y Dead Letter Queue (DLQ). |
| **Librería de Eventos Nativa** | `@nestjs/event-emitter` para eventos sincrónicos en memoria y BullMQ para eventos asíncronos distribuidos. |
| **Principio de Puerto/Adaptador** | Todas las integraciones externas se inyectan mediante interfaces abstractas, no implementaciones concretas. |

---

## 2. Estructura de Directorios

### 2.1. Estructura Completa del Backend

```text
backend/
├── src/
│   ├── main.ts                                    # Bootstrap con Fastify
│   ├── app.module.ts                              # Módulo raíz
│   │
│   ├── shared/                                    # Código COMPARTIDO entre módulos
│   │   ├── constants/                             # Enums, constantes de negocio
│   │   │   ├── user-status.constants.ts
│   │   │   ├── kyc-status.constants.ts
│   │   │   └── roles.constants.ts
│   │   ├── exceptions/                            # Excepciones personalizadas
│   │   │   ├── domain.exception.ts
│   │   │   ├── application.exception.ts
│   │   │   └── infrastructure.exception.ts
│   │   ├── types/                                 # Tipos compartidos
│   │   │   ├── common.types.ts
│   │   │   ├── api-response.types.ts
│   │   │   └── pagination.types.ts
│   │   └── utils/                                 # Utilidades puras
│   │       ├── date.utils.ts
│   │       ├── crypto.utils.ts
│   │       └── validation.utils.ts
│   │
│   ├── common/                                    # INFRAESTRUCTURA TRANSVERSAL
│   │   ├── decorators/                            # Decoradores personalizados
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   ├── require-roles.decorator.ts
│   │   │   └── require-kyc-level.decorator.ts
│   │   ├── guards/                                # Guards de autorización
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── kyc-level.guard.ts
│   │   │   └── webhook-signature.guard.ts
│   │   ├── interceptors/                          # Interceptores HTTP
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── timeout.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── distributed-tracing.interceptor.ts
│   │   ├── filters/                               # Filtros de excepción
│   │   │   ├── all-exceptions.filter.ts          # RFC 7807 Problem Details
│   │   │   ├── domain-exception.filter.ts
│   │   │   └── validation-exception.filter.ts
│   │   ├── pipes/                                 # Pipes de transformación
│   │   │   ├── zod-validation.pipe.ts
│   │   │   ├── parse-uuid.pipe.ts
│   │   │   └── parse-enum.pipe.ts
│   │   └── middleware/                            # Middlewares
│   │       ├── correlation-id.middleware.ts
│   │       ├── raw-body.middleware.ts
│   │       └── rate-limit.middleware.ts
│   │
│   ├── infrastructure/                            # IMPLEMENTACIONES CONCRETAS
│   │   ├── database/                              # PostgreSQL con Drizzle
│   │   │   ├── drizzle.module.ts
│   │   │   ├── drizzle.service.ts
│   │   │   ├── migrations/                        # Migraciones SQL
│   │   │   │   ├── 0001_initial.sql
│   │   │   │   └── 0002_add_kyc_tables.sql
│   │   │   └── schema/                            # Esquemas tipo-safe
│   │   │       ├── users.schema.ts
│   │   │       ├── sessions.schema.ts
│   │   │       ├── kyc.schema.ts
│   │   │       └── audit-logs.schema.ts
│   │   ├── cache/                                 # Redis Cache
│   │   │   ├── cache.module.ts
│   │   │   ├── cache.service.ts                   # Wrapper de ioredis
│   │   │   ├── cache.interceptor.ts               # Cache automático de queries
│   │   │   └── cache.invalidator.ts               # Invalidación automática
│   │   ├── queue/                                 # BullMQ Queues
│   │   │   ├── queue.module.ts
│   │   │   ├── queue.service.ts                   # Productor de eventos
│   │   │   └── processors/                        # Workers
│   │   │       ├── email.processor.ts
│   │   │       ├── whatsapp.processor.ts
│   │   │       ├── otp.processor.ts
│   │   │       └── kyc-webhook.processor.ts
│   │   ├── storage/                               # Cloudflare R2
│   │   │   ├── storage.module.ts
│   │   │   ├── storage.service.ts                 # Cliente S3
│   │   │   └── presigned-url.service.ts           # Generador de URLs firmadas
│   │   └── logging/                               # Logger estructurado
│   │       ├── logger.module.ts
│   │       ├── logger.service.ts                  # Wrapper de Pino
│   │       └── logger.config.ts                   # Configuración de transporte
│   │
│   ├── config/                                    # CONFIGURACIÓN VALIDADA
│   │   ├── index.ts                               # Exporta todos los configs
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── storage.config.ts
│   │   ├── kyc-provider.config.ts
│   │   ├── whatsapp.config.ts
│   │   ├── email.config.ts
│   │   └── env-schema.ts                          # Esquema Zod de .env
│   │
│   ├── modules/                                   # MÓDULOS DE DOMINIO
│   │   │
│   │   ├── auth/                                  # 🔐 AUTENTICACIÓN
│   │   │   ├── application/                       # Casos de uso
│   │   │   │   ├── commands/
│   │   │   │   │   ├── login.command.ts
│   │   │   │   │   ├── refresh-token.command.ts
│   │   │   │   │   └── logout.command.ts
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── login.handler.ts
│   │   │   │   │   ├── refresh-token.handler.ts
│   │   │   │   │   └── logout.handler.ts
│   │   │   │   └── queries/
│   │   │   │       └── validate-session.query.ts
│   │   │   ├── domain/                           # Entidades y reglas
│   │   │   │   ├── entities/
│   │   │   │   │   └── session.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── access-token.vo.ts
│   │   │   │   │   └── refresh-token.vo.ts
│   │   │   │   ├── ports/                        # Puertos de salida
│   │   │   │   │   ├── auth-repository.port.ts
│   │   │   │   │   └── token-generator.port.ts
│   │   │   │   └── events/
│   │   │   │       ├── user-logged-in.event.ts
│   │   │   │       └── user-logged-out.event.ts
│   │   │   ├── infrastructure/                   # Adaptadores
│   │   │   │   ├── repositories/
│   │   │   │   │   └── session.repository.ts
│   │   │   │   └── providers/
│   │   │   │       └── jwt-token-provider.ts
│   │   │   ├── presentation/                     # Controladores y DTOs
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   │   └── auth-response.dto.ts
│   │   │   │   └── strategies/
│   │   │   │       ├── local.strategy.ts
│   │   │   │       └── jwt.strategy.ts
│   │   │   └── auth.module.ts                    # ORQUESTACIÓN
│   │   │
│   │   ├── identity/                             # 👤 USUARIOS Y PERFILES
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── register-user.command.ts
│   │   │   │   │   ├── update-profile.command.ts
│   │   │   │   │   └── verify-email.command.ts
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── register-user.handler.ts
│   │   │   │   │   ├── update-profile.handler.ts
│   │   │   │   │   └── verify-email.handler.ts
│   │   │   │   └── queries/
│   │   │   │       ├── get-user.query.ts
│   │   │   │       └── list-users.query.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── email.vo.ts
│   │   │   │   │   ├── phone-number.vo.ts
│   │   │   │   │   └── password-hash.vo.ts
│   │   │   │   ├── ports/
│   │   │   │   │   ├── user-repository.port.ts
│   │   │   │   │   └── user-event-sender.port.ts
│   │   │   │   └── events/
│   │   │   │       ├── user-registered.event.ts
│   │   │   │       └── user-profile-updated.event.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── repositories/
│   │   │   │       └── postgres-user.repository.ts
│   │   │   ├── presentation/
│   │   │   │   ├── identity.controller.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── register-user.dto.ts
│   │   │   │   │   └── update-profile.dto.ts
│   │   │   │   └── validators/
│   │   │   │       └── unique-email.validator.ts
│   │   │   └── identity.module.ts
│   │   │
│   │   ├── verification/                         # 🛡️ KYC/KYB
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── start-verification.command.ts
│   │   │   │   │   ├── approve-verification.command.ts
│   │   │   │   │   └── reject-verification.command.ts
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── start-verification.handler.ts
│   │   │   │   │   ├── approve-verification.handler.ts
│   │   │   │   │   └── reject-verification.handler.ts
│   │   │   │   └── queries/
│   │   │   │       ├── get-verification-status.query.ts
│   │   │   │       └── get-verification-history.query.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── verification.entity.ts
│   │   │   │   │   └── document.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── verification-status.vo.ts
│   │   │   │   │   └── document-type.vo.ts
│   │   │   │   ├── ports/
│   │   │   │   │   ├── verification-repository.port.ts
│   │   │   │   │   └── kyc-provider.port.ts      # 🔌 Puerto clave
│   │   │   │   └── events/
│   │   │   │       ├── verification-started.event.ts
│   │   │   │       ├── verification-approved.event.ts
│   │   │   │       └── verification-rejected.event.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── postgres-verification.repository.ts
│   │   │   │   ├── adapters/                     # Adaptadores de proveedores
│   │   │   │   │   ├── onfido.adapter.ts
│   │   │   │   │   ├── sumsub.adapter.ts
│   │   │   │   │   └── veriff.adapter.ts
│   │   │   │   └── webhook-verifiers/
│   │   │   │       ├── webhook-signature.verifier.ts
│   │   │   │       └── webhook-event.parser.ts
│   │   │   ├── presentation/
│   │   │   │   ├── verification.controller.ts
│   │   │   │   ├── webhook.controller.ts          # Endpoint para webhooks
│   │   │   │   └── dto/
│   │   │   │       ├── start-verification.dto.ts
│   │   │   │       └── webhook-payload.dto.ts
│   │   │   └── verification.module.ts
│   │   │
│   │   └── notifications/                         # 📨 NOTIFICACIONES
│   │       ├── application/
│   │       │   ├── commands/
│   │       │   │   ├── send-otp.command.ts
│   │       │   │   ├── send-email.command.ts
│   │       │   │   └── send-whatsapp.command.ts
│   │       │   ├── handlers/
│   │       │   │   ├── send-otp.handler.ts
│   │       │   │   ├── send-email.handler.ts
│   │       │   │   └── send-whatsapp.handler.ts
│   │       │   └── queries/
│   │       │       └── get-notification-history.query.ts
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   └── notification.entity.ts
│   │       │   ├── value-objects/
│   │       │   │   ├── channel.vo.ts
│   │       │   │   └── template.vo.ts
│   │       │   ├── ports/                        # Puertos de salida
│   │       │   │   ├── email-sender.port.ts
│   │       │   │   ├── whatsapp-sender.port.ts
│   │       │   │   └── otp-generator.port.ts
│   │       │   └── events/
│   │       │       └── notification-sent.event.ts
│   │       ├── infrastructure/
│   │       │   ├── adapters/                     # Adaptadores concretos
│   │       │   │   ├── resend-email.adapter.ts
│   │       │   │   ├── meta-whatsapp.adapter.ts
│   │       │   │   └── twilio-sms.adapter.ts
│   │       │   └── generators/
│   │       │       └── secure-otp.generator.ts
│   │       ├── presentation/
│   │       │   ├── notifications.controller.ts
│   │       │   └── dto/
│   │       │       ├── send-otp.dto.ts
│   │       │       └── notification-response.dto.ts
│   │       └── notifications.module.ts
│   │
│   ├── jobs/                                      # TAREAS PROGRAMADAS
│   │   ├── scheduled-tasks.module.ts
│   │   ├── tasks/
│   │   │   ├── clean-sessions.task.ts
│   │   │   ├── clean-expired-kyc.task.ts
│   │   │   └── send-daily-digest.task.ts
│   │   └── processors/
│   │       └── task.processor.ts
│   │
│   └── seeds/                                     # DATOS DE PRUEBA
│       ├── seed.module.ts
│       ├── seed.service.ts
│       └── fixtures/
│           ├── users.fixture.ts
│           └── kyc.fixture.ts
│
├── test/                                          # PRUEBAS
│   ├── e2e/
│   │   ├── auth.e2e-spec.ts
│   │   ├── identity.e2e-spec.ts
│   │   └── verification.e2e-spec.ts
│   ├── integration/
│   │   ├── auth/
│   │   └── verification/
│   ├── unit/
│   │   ├── domain/
│   │   └── application/
│   ├── mocks/
│   │   ├── kyc-provider.mock.ts
│   │   └── email-sender.mock.ts
│   ├── setup.ts
│   └── test-utils.ts
│
├── .env.example
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── drizzle.config.ts
├── nest-cli.json
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### 2.2. Reglas de Estructura de Carpetas

| Regla | Explicación |
| :--- | :--- |
| **Cada módulo tiene su propia capa de dominio** | No se comparten entidades entre módulos; si se necesitan, se usa un contexto compartido. |
| **Infraestructura siempre depende de dominio** | Nunca al revés. Los adaptadores implementan puertos definidos en el dominio. |
| **Presentación usa DTOs, no entidades** | Los DTOs se transforman a comandos/queries antes de pasar a la capa de aplicación. |
| **No hay lógica de negocio en controladores** | Los controladores solo reciben request, validan, llaman a handlers y devuelven response. |
| **Cada módulo es autocontenido** | Puede ser extraído a microservicio en el futuro sin modificaciones externas drásticas. |
| **Código compartido solo en `/shared`** | Nada de importaciones relativas cruzadas entre módulos de dominio. |
| **Infraestructura transversal en `/common`** | Decoradores, guards, interceptors, filters, pipes y middleware globales. |

---

## 3. Módulos de Dominio

### 3.1. Módulo Auth (Autenticación)

- **Responsabilidad:** Gestión de sesiones, tokens JWT, login, logout y refresh.
- **Principio SOLID:** `LoginHandler` solo maneja login; `TokenGeneratorPort` permite cambiar de JWT sin modificar handlers; dependencias atadas a interfaces, no a implementaciones concretas.
- **Flujo de Login:** Controlador → Comando → Handler → Repositorio + TokenGenerator → Evento → Respuesta.
- **Componentes:**
  - **Commands:** `LoginCommand`, `RefreshTokenCommand`, `LogoutCommand`.
  - **Handlers & Queries:** `LoginHandler`, `RefreshTokenHandler`, `LogoutHandler`, `ValidateSessionQuery`.
  - **Domain Entities & Value Objects:** `Session`, `AccessToken`, `RefreshToken`.
  - **Ports:** `AuthRepositoryPort`, `TokenGeneratorPort`.
  - **Events:** `UserLoggedInEvent`, `UserLoggedOutEvent`.

### 3.2. Módulo Identity (Usuarios)

- **Responsabilidad:** Creación, actualización y consulta de perfiles de usuario.
- **Principio SOLID:** `RegisterUserHandler` usa `UserRepositoryPort` y emite `UserRegisteredEvent`; totalmente desacoplado de notificaciones.
- **Value Objects:** `Email` (validación y unicidad), `PhoneNumber` (formato internacional E.164), `PasswordHash` (hashing con Argon2/Bcrypt).
- **Componentes:**
  - **Commands:** `RegisterUserCommand`, `UpdateProfileCommand`, `VerifyEmailCommand`.
  - **Handlers & Queries:** `RegisterUserHandler`, `UpdateProfileHandler`, `VerifyEmailHandler`, `GetUserQuery`, `ListUsersQuery`.
  - **Domain Entities & Ports:** `User`, `UserRepositoryPort`, `UserEventSenderPort`.

### 3.3. Módulo Verification (KYC/KYB)

- **Responsabilidad:** Flujo de verificación de identidad y documentos corporativos con múltiples proveedores.
- **Principio SOLID:** `KycProviderPort` define el contrato; `OnfidoAdapter`, `SumsubAdapter`, `VeriffAdapter` son intercambiables; `Factory Pattern` selecciona el proveedor en runtime según el país o tipo de usuario.
- **Máquina de Estados:**
  ```text
  DRAFT → PENDING_DOCS → PROCESSING → APPROVED
                             │
                             ├──→ REJECTED → ACTION_REQUIRED
                             │
                             └──→ REVIEW_NEEDED
  ```
- **Componentes:**
  - **Commands:** `StartVerificationCommand`, `ApproveVerificationCommand`, `RejectVerificationCommand`.
  - **Entities & Ports:** `Verification`, `Document`, `VerificationRepositoryPort`, `KycProviderPort`.
  - **Events:** `VerificationStartedEvent`, `VerificationApprovedEvent`, `VerificationRejectedEvent`.
  - **Adapters:** `OnfidoAdapter`, `SumsubAdapter`, `VeriffAdapter`, `WebhookSignatureVerifier`.

### 3.4. Módulo Notifications (Notificaciones)

- **Responsabilidad:** Envío de comunicaciones a través de múltiples canales (Email, WhatsApp, SMS/OTP).
- **Principio SOLID:** `EmailSenderPort`, `WhatsAppSenderPort`, `OtpGeneratorPort` permiten cambiar de proveedores sin modificar casos de uso.
- **Flujo con BullMQ:** Handler envía comando a la cola → Worker procesa asíncronamente → Adapter envía mensaje → Persistencia en repositorio → Emisión de evento.
- **Componentes:**
  - **Commands & Handlers:** `SendOtpCommand`, `SendEmailCommand`, `SendWhatsAppCommand` y sus respectivos handlers.
  - **Ports & Adapters:** `EmailSenderPort` (`ResendAdapter`), `WhatsAppSenderPort` (`MetaWhatsAppAdapter`), `OtpGeneratorPort` (`SecureOtpGenerator`).
  - **Processors:** `OtpProcessor`, `EmailProcessor`, `WhatsAppProcessor`.

---

## 4. Infraestructura y Servicios

| Componente | Herramienta / Patrón | Descripción y Beneficio |
| :--- | :--- | :--- |
| **Configuración Validada** | **Zod (`env-schema.ts`)** | Verifica tipos, URLs, puertos, enumeraciones y secretos críticos al iniciar. Previene caídas en runtime por variables faltantes. |
| **Database** | **Drizzle ORM + PostgreSQL** | Pool de conexiones optimizado, esquemas type-safe (`users`, `sessions`, `kyc`, `audit_logs`), transacciones ACID manuales y migraciones SQL versionadas. Sin reflection ni sobrecoste de memoria. |
| **Cache Distribuido** | **Redis + ioredis** | Wrapper con TTL, `CacheInterceptor` para queries GET frecuentes e invalidación proactiva (`CacheInvalidator`) ante mutaciones de datos. |
| **Colas & Workers** | **BullMQ** | Productores desacoplados y workers especializados (`email`, `whatsapp`, `otp`, `kyc-webhook`). Reintentos exponenciales (4 intentos) y DLQ (`removeOnFail: false`) para auditoría. |
| **Storage Documental** | **Cloudflare R2 (S3 Client)** | Generación de Presigned URLs firmadas para subidas y descargas directas. Cero paso de binarios pesados por la API, validación de MIME types (`jpeg`, `png`, `pdf`). |
| **Logging Estructurado** | **Pino (`nestjs-pino`)** | Logs en formato JSON con inyección automática de `traceId` y `correlationId` para trazabilidad punta a punta en Grafana o Datadog. |

---

## 5. Patrones de Diseño Implementados

| Patrón | Aplicación en el Proyecto | Ejemplo Concreto |
| :--- | :--- | :--- |
| **Command Pattern** | Encapsulamiento de operaciones de mutación/escritura | `LoginCommand`, `RegisterUserCommand` |
| **Query Pattern** | Encapsulamiento de operaciones de lectura optimizada | `GetUserQuery`, `GetVerificationStatusQuery` |
| **Handler Pattern** | Ejecución desacoplada de casos de uso | `LoginHandler`, `RegisterUserHandler` |
| **Repository Pattern** | Abstracción de la capa de persistencia | `UserRepositoryPort` implementado por `PostgresUserRepository` |
| **Factory Pattern** | Instanciación dinámica según contexto de negocio | `KycProviderFactory`, `NotificationChannelFactory` |
| **Strategy Pattern** | Algoritmos y proveedores externos intercambiables | Estrategias de envío de email (Resend, SendGrid, SES) |
| **Observer Pattern** | Desacoplamiento de efectos secundarios | `EventEmitter` emitiendo `UserRegisteredEvent` |
| **Decorator Pattern** | Metadatos y comportamiento declarativo en endpoints | `@CurrentUser()`, `@RequireRoles()`, `@Public()` |
| **Adapter Pattern** | Traducción de interfaces externas a puertos de dominio | `OnfidoAdapter`, `MetaWhatsAppAdapter` |
| **Singleton Pattern** | Gestión de ciclo de vida de clientes de infraestructura | `DrizzleService`, `CacheService`, `S3StorageService` |
| **Builder Pattern** | Construcción de consultas complejas o reportes | Constructores dinámicos en repositorios con Drizzle |

---

## 6. Seguridad y Resiliencia

### 6.1. Estrategia de Tokens y Sesiones
- **Access Token:** JWT firmado con clave asimétrica o secreta fuerte, expiración corta (15 minutos).
- **Refresh Token:** JWT o token criptográfico con expiración de 7 días, persistido en Redis (`refresh:{userId}`).
- **Refresh Rotation:** Cada renovación invalida el refresh token anterior e introduce uno nuevo. Detección de reuso para revocación preventiva de todas las sesiones activas.
- **Revocación Instantánea:** Eliminar la clave `session:{userId}` en Redis revoca el acceso en milisegundos sin esperar a que expire el JWT.

### 6.2. Rate Limiting Distribuido
- Implementación de `@nestjs/throttler` con almacenamiento distribuido en Redis (`ThrottlerStorageRedisService`).
- **Endpoints estándar:** 60 peticiones/minuto.
- **Endpoints críticos:** 3 solicitudes de OTP cada 5 minutos por IP o número de teléfono.

### 6.3. Validación de Webhooks Externos
- `WebhookSignatureGuard` intercepta llamadas de KYC y Meta WhatsApp.
- Preservación de `req.rawBody` mediante middleware dedicado para cálculo de firmas HMAC SHA-256 antes de que Fastify/Express parsee el JSON.

### 6.4. Auditoría y Trazabilidad de Seguridad
- Registro en la tabla `audit_logs` de PostgreSQL para eventos críticos: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `PASSWORD_CHANGE`, `EMAIL_CHANGE`, `SESSION_REVOKED`.
- Metadatos obligatorios: IP del cliente, User-Agent, Correlation ID, Timestamp UTC y Payload saneado.

### 6.5. Configuración Estricta de Cookies
- `httpOnly: true` (Inaccesible desde JavaScript, mitiga XSS).
- `secure: true` (Solo transmitido por HTTPS).
- `sameSite: 'strict'` (Protección nativa contra CSRF).
- `domain`: Restringido al dominio raíz corporativo para compartir entre Next.js y NestJS.

---

## 7. Estrategia de Base de Datos

### 7.1. Tablas Principales

| Tabla | Descripción | Índices Clave |
| :--- | :--- | :--- |
| `users` | Usuarios registrados en el marketplace | `email` (UNIQUE), `phone` (UNIQUE), `status` |
| `sessions` | Sesiones y refresh tokens activos | `user_id`, `refresh_token`, `expires_at` |
| `audit_logs` | Pistas de auditoría de seguridad | `user_id`, `timestamp`, `event_type` |
| `verifications`| Instancias de verificación KYC/KYB | `user_id`, `status`, `provider_session_id` |
| `documents` | Archivos probatorios subidos a R2 | `verification_id`, `document_type`, `s3_key` |

### 7.2. Principios de Persistencia
1. **Transacciones Explícitas:** Bloques `db.transaction(async (tx) => ...)` para operaciones compuestas (creación de usuario + asignación de perfil + registro de auditoría).
2. **Enums Nativos en BD:** Mapeo de `verification_status` (`DRAFT`, `PENDING_DOCS`, `PROCESSING`, `APPROVED`, `REJECTED`, `ACTION_REQUIRED`, `REVIEW_NEEDED`).
3. **Máquinas de Estado:** Comprobación estricta de transiciones válidas antes de ejecutar `UPDATE` en base de datos.
4. **Consultas Selectivas:** Proyecciones de columnas explícitas (`select({ id: users.id, email: users.email })`), evitando `SELECT *`.
5. **Pool de Conexiones:** Pool configurado con un límite estándar de 20 conexiones concurrentes y timeout de conexión de 5 segundos.

---

## 8. Manejo de Errores y Logging

### 8.1. Excepciones Jerárquicas

| Tipo de Excepción | Uso Previsto | Código HTTP |
| :--- | :--- | :--- |
| `DomainException` | Violación de reglas de negocio (ej. email duplicado, estado inválido) | 400 Bad Request / 409 Conflict |
| `ApplicationException` | Comandos malformados o precondiciones no cumplidas | 400 Bad Request |
| `InfrastructureException` | Caída de conexión a BD, timeouts de R2 o falla de proveedor KYC | 503 Service Unavailable / 502 Bad Gateway |
| `NotFoundException` | Entidad o recurso inexistente | 404 Not Found |
| `UnauthorizedException` | Credenciales inválidas o token expirado | 401 Unauthorized |
| `ForbiddenException` | Usuario autenticado sin rol o nivel KYC suficiente | 403 Forbidden |

### 8.2. Formato de Error RFC 7807 (Problem Details)

```json
{
  "type": "https://api.marketplace.com/errors/domain",
  "title": "Business Rule Violation",
  "status": 409,
  "detail": "El correo electrónico ya se encuentra registrado.",
  "instance": "/api/v1/identity/register",
  "timestamp": "2026-09-02T10:30:00.000Z",
  "traceId": "c1f7a9d2-3b4e-4f81-9b7e-6e8d1a2c3b4e"
}
```

### 8.3. Logging Estructurado
- **Correlation ID:** Generado en `correlation-id.middleware.ts` y propagado vía headers (`x-correlation-id`) en respuestas y jobs de BullMQ.
- **Niveles:** `trace`, `debug`, `info`, `warn`, `error`, `fatal`.
- **Contexto estándar en log:** `traceId`, `userId`, `module`, `method`, `executionTimeMs`.

---

## 9. Pruebas y Calidad

### 9.1. Estrategia y Cobertura de Pruebas

| Capa | Ubicación | Cobertura Mínima | Alcance |
| :--- | :--- | :---: | :--- |
| **Domain** | `test/unit/domain/` | **90%** | Entidades puras, Value Objects, validaciones de dominio. |
| **Application** | `test/unit/application/` | **85%** | Handlers de comandos, handlers de queries, reglas de orquestación. |
| **Infrastructure** | `test/integration/` | **70%** | Repositorios reales con Testcontainers (Postgres, Redis), adaptadores. |
| **Presentation** | `test/e2e/` | **60%** | Flujos completos HTTP con Fastify y bases de datos aisladas. |

### 9.2. Herramientas del Ecosistema
- **Vitest:** Runner principal para pruebas unitarias e integración rápida con soporte nativo de ESM.
- **Supertest:** Simulación de peticiones HTTP en pruebas E2E.
- **Testcontainers:** Inicialización dinámica de contenedores Docker de PostgreSQL y Redis durante pruebas automatizadas en CI.
- **Vitest Coverage:** Reporte con motor v8.

---

## 10. Checklist de Producción

### 10.1. Seguridad
- [ ] Claves y secretos JWT con más de 32 caracteres criptográficos en variables de entorno.
- [ ] Forzado de protocolo HTTPS en producción mediante Reverse Proxy / Cloudflare.
- [ ] CORS restrictivo configurado exclusivamente para el dominio de Next.js.
- [ ] Rate Limiting habilitado para endpoints sensibles (Login, Registro, OTP).
- [ ] Verificación de firmas HMAC activa en webhooks entrantes con validación de Raw Body.
- [ ] Cookies protegidas con atributos `httpOnly`, `secure` y `sameSite=strict`.
- [ ] Cabeceras de seguridad HTTP configuradas con Helmet.
- [ ] Tabla `audit_logs` activa y capturando eventos de autenticación.

### 10.2. Infraestructura
- [ ] Conexión a PostgreSQL con pool dimensionado (máximo 20 conexiones).
- [ ] Redis con persistencia y política de reintento/Sentinel para alta disponibilidad.
- [ ] Cloudflare R2 con bucket privado y restricciones de bucket policies.
- [ ] Colas BullMQ con Dead Letter Queue (DLQ) configurada para reprocesamiento.
- [ ] Logs estructurados en JSON canalizados a colector de observabilidad.
- [ ] Endpoint de salud `/health` implementado para sondas de Kubernetes / Cloud Providers.

### 10.3. Rendimiento y Escalabilidad
- [ ] Plataforma Fastify configurada en lugar de Express.
- [ ] Cache activo en queries de lectura de alto impacto.
- [ ] Presigned URLs obligatorias para evitar streaming de archivos por NestJS.
- [ ] Procesamiento asíncrono con BullMQ para OTP, emails y WhatsApp.
- [ ] Timeout interceptor global configurado para mitigar bloqueos de recursos.

### 10.4. Monitoreo y DevOps
- [ ] Métricas con OpenTelemetry exportadas hacia Prometheus / Grafana.
- [ ] Trazabilidad distribuida con propagación del Correlation ID.
- [ ] Dockerfile optimizado mediante Multi-stage build (distroless/alpine).
- [ ] Orquestación local validada con `docker-compose.yml`.
- [ ] Migraciones SQL automáticas auditadas y ejecutadas antes de lanzar la aplicación.

### 10.5. Documentación y Mantenimiento
- [ ] OpenAPI / Swagger autogenerado a partir de esquemas Zod con `nestjs-zod`.
- [ ] Manual de incorporación y `README.md` actualizado con instrucciones de arranque.
- [ ] Fixtures y scripts de Seed listos para entornos locales y staging.
- [ ] Auditoría mensual automatizada de dependencias con `pnpm audit` / `npm audit`.

---

## 11. Resumen Ejecutivo

| Aspecto | Estado / Decisión Técnica |
| :--- | :--- |
| **Arquitectura Base** | Modular Monolith con Clean Architecture + DDD + Hexagonal |
| **Principios Clave** | SOLID, CQRS, Event-Driven |
| **ORM & BD** | Drizzle ORM (Type-Safe, Zero Reflection) + PostgreSQL |
| **Cache & Colas** | Redis distribuido con BullMQ |
| **Storage** | Cloudflare R2 (Presigned URLs Direct-to-Storage) |
| **Autenticación** | JWT + Refresh Token Rotation en Redis + Cookies HttpOnly |
| **Patrones Clave** | Command, Query, Handler, Repository, Factory, Strategy, Adapter |
| **Pruebas** | Vitest + Testcontainers + Supertest |
| **Observabilidad** | Logs JSON (Pino) + OpenTelemetry |
| **Seguridad** | Throttling Redis, Verificación HMAC Webhooks, Audit Logs, Helmet |

---
*Fin del Documento*
