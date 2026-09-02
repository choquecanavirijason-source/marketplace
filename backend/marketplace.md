# SimpleMarketplace360 - Documento Maestro Técnico y Funcional (Módulos 1 al 15)

**Versión:** Consolidada Integral para Desarrollo, QA, DevOps, Producto y Dirección Técnica  
**Estado:** ✅ Listo para Desarrollo y Arquitectura de Referencia  
**Stack Base Transversal:** Next.js (TypeScript) + NestJS (TypeScript) + PostgreSQL + Redis + OpenSearch + Cloudflare R2 (S3-compatible) + Docker

---

## 📋 Índice General

1. [Criterio de Compilación y Arquitectura Base](#criterio-de-compilación-y-arquitectura-base)
2. [Módulo 1: Usuarios, Autenticación, Roles, Perfiles y Onboarding](#módulo-1-usuarios-autenticación-roles-perfiles-y-onboarding)
3. [Módulo 2: Catálogo, Categorías, Productos, Variantes y Publicación](#módulo-2-catálogo-categorías-productos-variantes-y-publicación)
4. [Módulo 3: Búsqueda, Discovery, Filtros, Ordenamiento y Recomendaciones](#módulo-3-búsqueda-discovery-filtros-ordenamiento-y-recomendaciones)
5. [Módulo 4: Carrito, Checkout y Validación de Compra](#módulo-4-carrito-checkout-y-validación-de-compra)
6. [Módulo 5: Pagos, Autorización, Conciliación y Escrow Ledger](#módulo-5-pagos-autorización-conciliación-y-escrow-ledger)
7. [Módulo 6: Órdenes, Post-compra y Lifecycle Operativo del Pedido](#módulo-6-órdenes-post-compra-y-lifecycle-operativo-del-pedido)
8. [Módulo 7: Logística, Envíos, Tracking, SLA e Incidencias](#módulo-7-logística-envíos-tracking-sla-e-incidencias)
9. [Módulo 8: Panel Vendedor, Gestión Operativa del Seller y Performance](#módulo-8-panel-vendedor-gestión-operativa-del-seller-y-performance)
10. [Módulo 9: CRM, Leads, Automatización Comercial, Scoring y Trazabilidad Omnicanal](#módulo-9-crm-leads-automatización-comercial-scoring-y-trazabilidad-omnicanal)
11. [Módulo 10: Community Manager, Bandeja Omnicanal, Campañas y Respuestas Asistidas](#módulo-10-community-manager-bandeja-omnicanal-campañas-y-respuestas-asistidas)
12. [Módulo 11: Live Shopping, Streaming Interactivo, Productos en Vivo y Ofertas en Tiempo Real](#módulo-11-live-shopping-streaming-interactivo-productos-en-vivo-y-ofertas-en-tiempo-real)
13. [Módulo 12: Seguridad, Anti-fraude, KYC/KYB y Control de Confianza](#módulo-12-seguridad-anti-fraude-kyckyb-y-control-de-confianza)
14. [Módulo 13: Búsqueda Inteligente, Recomendador, Capa IA, Ranking Semántico y Asistentes de Decisión](#módulo-13-búsqueda-inteligente-recomendador-capa-ia-ranking-semántico-y-asistentes-de-decisión)
15. [Módulo 14: Archivos, Fotos, Documentos KYC, Media Storage y Gestión de Assets](#módulo-14-archivos-fotos-documentos-kyc-media-storage-y-gestión-de-assets)
16. [Módulo 15: Administración, Backoffice, Auditoría, Soporte Operativo, Configuración Global y Control de Plataforma](#módulo-15-administración-backoffice-auditoría-soporte-operativo-configuración-global-y-control-de-plataforma)

---

## Criterio de Compilación y Arquitectura Base

Este documento consolida los 15 módulos troncales del marketplace bajo una misma estructura documental: definición del módulo, objetivos, alcance, funciones obligatorias, reglas de negocio, arquitectura, modelo de datos, APIs, seguridad, testing, roadmap y definition of done.

La intención del documento es servir como base de planificación, estimación, diseño, desarrollo, QA, seguridad, DevOps e integración entre equipos.

- **Frontend:** Next.js con TypeScript, App Router, Server Components, SSR/ISR, Tailwind CSS.
- **Backend:** NestJS con TypeScript (Modular Monolith con DDD / Clean Architecture / Hexagonal).
- **Persistencia Transaccional:** PostgreSQL con Drizzle ORM o TypeORM (migraciones versionadas, ACID).
- **Caché, Colas y Locks:** Redis con BullMQ.
- **Motor de Búsqueda y Discovery:** OpenSearch.
- **Almacenamiento de Assets:** Cloudflare R2 (compatible S3) con presigned URLs y CDN.
- **Streaming en Vivo:** AWS IVS (Interactive Video Service) o WebRTC.
- **Observabilidad:** Logs estructurados JSON (Pino) + Métricas y Trazas con OpenTelemetry.

---

## Módulo 1: Usuarios, Autenticación, Roles, Perfiles y Onboarding

### 1. Definición del Módulo 1
El módulo 1 es el módulo fundacional del marketplace. Su responsabilidad es crear, autenticar, identificar, segmentar y controlar a todos los usuarios del ecosistema. Soporta compradores, vendedores, administradores, operadores internos y futuras cuentas B2B. Sin este módulo no existe seguridad, trazabilidad ni control de acceso para el resto de la plataforma.

### 2. Objetivos del Módulo
- Resolver de forma robusta cuatro problemas críticos: identidad digital, seguridad de acceso, gobierno de permisos y onboarding progresivo.
- Dejar el sistema preparado para escalar a verificación biométrica/KYC, wallet, pagos, CRM, logística y B2B sin rehacer la base.
- Permitir registro rápido y seguro por email, celular o social login configurable.
- Soportar inicio de sesión con JWT, refresh token rotativo, control de sesiones y cierre remoto.
- Administrar roles y permisos finos para buyer, seller, admin, support, finance y operadores.
- Gestionar perfil personal, perfil comercial y estados de onboarding.
- Registrar auditoría, eventos de seguridad, intentos fallidos, bloqueos, device fingerprint y aceptación de términos.

### 3. Actores que debe soportar
| Actor | Descripción funcional | Permisos base |
| :--- | :--- | :--- |
| **Comprador** | Usuario final que navega, compra, conversa y paga. | Registro, login, perfil, direcciones, favoritos, compras. |
| **Vendedor** | Cuenta comercial que publica y administra productos. | Todo buyer + perfil comercial, datos fiscales, tiendas, catálogo. |
| **Administrador** | Equipo central del marketplace. | Gestión total, bloqueo, revisión, cambio de estado, soporte. |
| **Soporte / Operaciones** | Usuario interno con acceso restringido. | Ver cuentas, tickets, auditoría, desbloqueos acotados. |
| **Finanzas / Riesgo** | Equipo antifraude y conciliación. | Verificación, estados KYC, flags, historial de seguridad. |

### 4. Funciones Obligatorias
- **4.1 Registro de usuarios:** Validación de formato y unicidad por email; registro por teléfono con OTP (SMS o WhatsApp); social login federado (Google, Apple, Meta); detección de cuentas duplicadas; selección de cuenta (comprador, vendedor individual, vendedor empresa); aceptación obligatoria de términos/políticas; estado inicial de onboarding.
- **4.2 Login y autenticación:** Email + password; teléfono + OTP; social login; soporte MFA/2FA opcional por OTP o app de autenticación; refresh token rotativo y revocación de sesiones; recordar dispositivo confiable; rate limiting, captcha adaptativo y bloqueo temporal contra fuerza bruta.
- **4.3 Recuperación de acceso:** Olvido de contraseña con token uniuso y expiración; reseteo invalidando sesiones activas; recuperación por email o SMS; bitácora completa del evento para auditoría.
- **4.4 Gestión de perfiles:** Perfil personal (nombre, apellido, foto, fecha nacimiento, idioma, moneda); perfil de contacto (emails alternativos, teléfonos, WhatsApp); perfil comercial (razón social, CUIT/CUIL, nombre fantasía, domicilio fiscal, responsable legal); porcentaje de completitud; direcciones múltiples.
- **4.5 Roles y permisos:** RBAC granular por recurso/acción; roles compuestos y herencia; lectura, escritura, aprobación, bloqueo y exportación; guards/middleware en backend y frontend.
- **4.6 Onboarding y estados:** Wizard diferenciado buyer/seller. Estados de cuenta: `pendiente`, `activa`, `restringida`, `suspendida`, `en_revision`, `rechazada`, `eliminada_logicamente`. Estados de onboarding: registro base, email verificado, teléfono verificado, perfil completo, términos aceptados, KYC pendiente, KYC aprobado/rechazado.
- **4.7 Verificación y seguridad base:** Validación estructural de identidad, teléfono y email; preparación para KYC/KYB desacoplado; captura de device fingerprint, IP, user agent y geoseñales; alertas por actividad anómala; bloqueo manual y automático tipificado.
- **4.8 Sesiones y dispositivos:** Listado de sesiones activas; revocación puntual o global; expiración por política; revocación ante cambio de clave o alerta de fraude.
- **4.9 Auditoría y trazabilidad:** Log inmutable con actor, timestamp, origen, payload y resultado. Eventos: registro, login ok/fallido, logout, refresh, password reset, cambio de email, bloqueo, verificación y cambio de rol.

### 5. Reglas de Negocio Críticas
1. Un email, teléfono o documento no debe vincularse a múltiples cuentas activas sin pasar por reglas de revisión.
2. Un vendedor no puede publicar productos si no completó el onboarding comercial mínimo.
3. Un usuario suspendido no puede autenticarse ni operar (salvo acceso de soporte).
4. Todo cambio sensible requiere reautenticación previa.
5. Los refresh tokens deben rotar y quedar invalidados si se detecta uso reutilizado (reuse detection).
6. Las bajas de usuarios deben ser lógicas (`deleted_at`), nunca físicas.

### 6. Flujos Principales
| Flujo | Entrada | Proceso | Salida esperada |
| :--- | :--- | :--- | :--- |
| **Registro buyer** | Email/teléfono + clave/OTP | Validación + creación + verificación | Cuenta creada y onboarding iniciado |
| **Registro seller** | Datos personales + comerciales | Validación + cuenta + perfil comercial | Cuenta creada con restricciones iniciales |
| **Login** | Credenciales válidas | Autenticación + emisión tokens + auditoría | Sesión activa con tokens |
| **Recuperación** | Email o teléfono | Token/OTP + validación + reseteo | Acceso restaurado e invalidación |
| **Cambio de rol** | Solicitud interna autorizada | Validación permiso + persistencia + auditoría | Rol actualizado |
| **Bloqueo preventivo**| Señal de riesgo o manual | Cambio de estado + invalidación sesiones | Cuenta restringida/suspendida |

### 7. Arquitectura y Stack
- **Frontend:** Next.js App Router, formularios tipados, server actions / API routes, guards de rutas.
- **Backend:** NestJS modular monolítico (bounded contexts: auth, users, profiles, roles, verification, sessions, audit).
- **Persistencia:** PostgreSQL como fuente de verdad. Redis para OTP, rate limiting, sesiones y flags.
- **Integraciones:** Proveedores de email, SMS/WhatsApp, captcha adaptativo, KYC/KYB y event bus interno.

### 8. Submódulos Internos
- `Auth`: Login, logout, refresh token rotation, password reset, MFA.
- `Users`: Ciclo de vida y entidad de usuario central.
- `Profiles`: Perfil personal, perfil comercial, direcciones y preferencias.
- `Roles/Permissions`: RBAC granular por recurso y acción.
- `Verification`: Verificación de contacto y conector con KYC.
- `Sessions`: Control de dispositivos y sesiones activas.
- `Audit`: Bitácora inmutable de eventos críticos.

### 9. Modelo de Datos Mínimo
- `users`: `id`, `uuid`, `status`, `type`, `email`, `phone`, `password_hash`, `email_verified_at`, `phone_verified_at`, `created_at`, `updated_at`, `deleted_at`.
- `user_profiles`: `user_id`, `first_name`, `last_name`, `avatar_url`, `birth_date`, `language`, `currency`, `completion_pct`.
- `business_profiles`: `user_id`, `legal_name`, `trade_name`, `tax_id`, `legal_type`, `billing_email`, `fiscal_address`, `review_status`.
- `roles`: `id`, `codename`, `name`, `is_system`.
- `permissions`: `id`, `resource`, `action`, `code`.
- `user_roles`: `user_id`, `role_id`, `assigned_by`, `assigned_at`.
- `role_permissions`: `role_id`, `permission_id`.
- `addresses`: `user_id`, `label`, `country`, `province`, `city`, `street`, `number`, `zip`, `is_default`.
- `verification_tokens`: `user_id`, `type`, `token_hash`, `expires_at`, `consumed_at`, `metadata`.
- `sessions`: `user_id`, `refresh_token_hash`, `device_id`, `ip`, `user_agent`, `last_seen_at`, `revoked_at`.
- `security_events`: `user_id`, `event_type`, `severity`, `ip`, `device_id`, `details_json`, `created_at`.
- `onboarding_states`: `user_id`, `step_code`, `status`, `completed_at`.

### 10. Endpoints / APIs Sugeridos
- `POST /auth/register` - Registro base.
- `POST /auth/login` - Login credenciales.
- `POST /auth/login/otp` - Login con código OTP.
- `POST /auth/refresh` - Rotación de tokens.
- `POST /auth/logout` - Logout sesión actual.
- `POST /auth/logout-all` - Cierre global de sesiones.
- `POST /auth/forgot-password` - Solicitud de recuperación.
- `POST /auth/reset-password` - Reseteo de contraseña con token.
- `POST /auth/verify-email` - Confirmación de email.
- `POST /auth/send-phone-otp` - Envío de código OTP SMS/WhatsApp.
- `POST /auth/verify-phone-otp` - Verificación de código telefónico.
- `GET /me` - Datos del perfil autenticado.
- `PATCH /me/profile` - Actualizar perfil personal.
- `PATCH /me/business` - Actualizar perfil comercial.
- `GET /me/sessions` - Listar sesiones activas.
- `DELETE /me/sessions/:id` - Revocar sesión específica.
- `GET /admin/users` - Búsqueda administrativa de usuarios.
- `PATCH /admin/users/:id/status` - Bloquear, suspender o reactivar usuario.
- `PATCH /admin/users/:id/roles` - Asignar o revocar roles.
- `GET /admin/users/:id/audit` - Consultar auditoría de seguridad del usuario.

### 11. Validaciones Técnicas Obligatorias
- Contraseñas con longitud mínima, complejidad, chequeo contra listas de claves comprometidas y hash Argon2id o bcrypt.
- Tokens sensibles siempre hasheados en base de datos.
- Idempotencia en endpoints de reenvío de códigos, recuperación y refresh.
- Normalización obligatoria de emails, teléfonos y números de documento.
- Protección CSRF, cookies HttpOnly, Secure, SameSite estricto y CORS restrictivo.
- Logs estructurados con `correlation_id`.

### 12. Requisitos No Funcionales
- **Seguridad:** Cumplimiento de OWASP ASVS básico para autenticación, rate limiting y rotación de secretos.
- **Performance:** Login y refresh < 400 ms; lectura de perfil < 250 ms.
- **Escalabilidad:** Modelo desacoplado preparado para millones de usuarios.
- **Observabilidad:** Trazas distribuidas, métricas y dashboard de alertas de seguridad.
- **Mantenibilidad:** DTOs con validación estricta y testing continuo.

### 13. Seguridad y Anti-fraude
- Bloqueo progresivo por intentos fallidos.
- Captcha adaptativo ante señales de riesgo.
- Invalidación de sesiones ante cambio de credenciales.
- Monitoreo de IP, ASN, huella de dispositivo y velocidad de creación de cuentas.
- Listas negras/grises de identificadores sospechosos.

### 14. UX Mínima Frontend
- Registro con validación en tiempo real.
- Mensajes de error claros sin filtrar datos sensibles.
- Wizard de onboarding con guardado de progreso.
- Panel de perfil con badges de verificación.
- Vista móvil prioritaria (mobile-first).

### 15. Testing Requerido
- Unit tests: Servicios de autenticación, validadores, mappers y guards.
- Integration tests: Flujos de registro, login, refresh, reseteo y cambio de estado.
- E2E tests: Caminos críticos completos de comprador y vendedor.
- Security tests: Fuerza bruta, repetición de token, escalamiento de privilegios.
- Carga: Pruebas de estrés sobre endpoints de login y refresh.

### 16. Backlog Técnico por Fases
- **Fase 1 (Base de identidad):** Entidades troncales, registro email/login, verificación de email y recuperación de clave.
- **Fase 2 (Seguridad y gobierno):** Refresh tokens rotativos, revocación de sesiones, RBAC, auditoría y rate limiting.
- **Fase 3 (Onboarding seller y verificación):** Perfil comercial, OTP telefónico, motor de estados y conector KYC.
- **Fase 4 (Operación interna y hardening):** Backoffice administrativo, dashboards de seguridad y pruebas E2E.

### 17. Definition of Done (DoD)
- Flujos probados end-to-end en staging.
- Suite de pruebas automatizadas en CI.
- OpenAPI/Swagger actualizado.
- 100% de rutas protegidas por guards de autenticación/autorización.
- Auditoría registrada y visible para operaciones.

### 18. Riesgos Técnicos y Operativos
- Fraude por cuentas falsas, abuso promocional o suplantación.
- Inconsistencia en permisos y filtración de datos sensibles.
- Fricción en onboarding que reduzca conversión comercial.

### 19. Recomendación Final
Construir como capa de identidad modular e independiente, evitando acoplamiento directo con lógica específica de pagos o logística.

### 20. Entregables del Equipo
Código versionado, migraciones SQL, colección OpenAPI/Swagger, documentación de variables de entorno y suites de pruebas.

### 21. Estructura de Directorios Backend
```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── profiles/
│   ├── roles/
│   ├── verification/
│   ├── sessions/
│   └── audit/
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── interceptors/
│   ├── filters/
│   └── events/
└── database/migrations/
```

### 22. Pipeline CI/CD Mínimo
Linter y typecheck -> Pruebas unitarias e integración -> Migraciones en BD efímera -> Build de imágenes -> Escaneo de vulnerabilidades -> Deploy a staging con smoke tests.

---

## Módulo 2: Catálogo, Categorías, Productos, Variantes y Publicación

### 1. Propósito del Módulo
El Módulo 2 es el núcleo estructural del inventario comercial del marketplace. Define un catálogo maestro capaz de sostener miles o millones de SKUs con consistencia técnica, comercial y operativa, reutilizable por retail, B2B, live shopping, CRM y panel seller.

### 2. Objetivos Funcionales
- Crear y administrar un catálogo jerárquico y extensible.
- Soportar tipos de producto: simple, variable, pack, kit o servicios futuros.
- Fichas comerciales completas según categoría.
- Atributos normalizados y controlados.
- Modelado de variantes con combinaciones válidas (color, talle, capacidad).
- Gestión multimedia vinculada a producto y variantes.
- Control de flujo de publicación (estados).
- Persistencia de stock base y precios base.
- Proyección indexada hacia OpenSearch.

### 3. Alcance Incluido y Excluido
- **Incluido:** Taxonomía, categorías, atributos, productos, variantes, media, precios base, stock lógico, publicación, reindexación, slugs SEO, versionado y auditoría.
- **Excluido:** Checkout, procesamiento de pagos, cálculo avanzado de fletes, cupones complejos y sincronización completa con ERPs externos.

### 4. Mapa de Submódulos
- 4.1 Taxonomía y categorías
- 4.2 Atributos y plantillas
- 4.3 Producto maestro
- 4.4 Variantes y combinaciones
- 4.5 Media manager
- 4.6 Precios y stock base
- 4.7 Workflow de publicación
- 4.8 Indexación y búsqueda
- 4.9 Auditoría y versionado

### 5. Funciones Obligatorias
- Categorías: Árbol jerárquico, slugs, orden visual, estado activo/inactivo.
- Atributos: Tipos texto, número, decimal, booleano, select, multiselect, color, medida, URL.
- Plantillas: Campos obligatorios y filtrables por categoría.
- CRUD de Productos: Alta, edición, clonado para carga masiva y control de borrador.
- Variantes: Generación por matriz de atributos, evitando duplicados.
- Media: Subida, orden, reemplazo y asignación de imagen principal.
- Precios y Stock: Precio lista, referencia, umbrales y stock disponible.
- Flujo de Publicación: Borrador -> En revisión -> Aprobado -> Publicado -> Pausado -> Rechazado -> Archivado.
- Indexación: Notificación de eventos a OpenSearch.
- Auditoría: Registro de creador, editor, timestamps y cambios.

### 6. Entidades Principales del Modelo de Datos
- `category`: `id`, `parent_id`, `name`, `slug`, `path`, `level`, `sort_order`, `is_active`.
- `attribute_definition`: `id`, `code`, `label`, `data_type`, `unit`, `is_filterable`, `is_searchable`, `options_json`.
- `category_attribute_rule`: `category_id`, `attribute_id`, `is_required`, `applies_to_variant`, `input_order`.
- `product`: `id`, `seller_id`, `category_id`, `brand_id`, `title`, `slug`, `short_desc`, `long_desc`, `status`, `visibility`.
- `product_attribute_value`: `product_id`, `attribute_id`, `value_text`, `value_number`, `value_json`.
- `product_variant`: `id`, `product_id`, `sku`, `barcode`, `status`, `price`, `stock_available`, `weight`, `dimensions`.
- `variant_attribute_value`: `variant_id`, `attribute_id`, `option_value`.
- `product_media`: `id`, `product_id`, `variant_id`, `file_url`, `media_type`, `is_primary`, `position`, `alt_text`.
- `product_search_projection`: `product_id`, `index_payload`, `last_indexed_at`, `checksum`.
- `product_audit_log`: `entity_type`, `entity_id`, `action`, `actor_id`, `before_json`, `after_json`.

### 7. Reglas de Negocio Críticas
1. Un producto pertenece a una única categoría principal.
2. Bloqueo de publicación si faltan atributos obligatorios.
3. Cada variante requiere un SKU único e irrepetible.
4. No se permiten dos variantes con la misma combinación exacta de atributos.
5. Imagen principal obligatoria para publicación.
6. Ficha técnica obligatoria si la categoría lo exige.
7. Slugs únicos por producto.
8. El stock no puede ser negativo.
9. Los filtros de búsqueda se derivan solo de atributos marcados como `filterable`.
10. Toda edición en producto publicado dispara reindexación automática.

### 8. Flujo Funcional Recomendado
1. Selección de categoría -> 2. Carga del producto maestro -> 3. Carga de atributos estructurados -> 4. Generación de variantes -> 5. Validación integral -> 6. Guardado en borrador -> 7. Revisión y publicación -> 8. Indexación a OpenSearch.

### 9. Backend y Servicios
- NestJS modular: `catalog`, `categories`, `attributes`, `products`, `variants`, `media`, `pricing`, `stock`, `publication`, `indexing`, `audit`.
- Patrones: Repositorios tipados, DTOs con `class-validator`, procesamiento asíncrono con BullMQ para reindexación y eventos de dominio (`product.created`, `product.published`, etc.).

### 10. Frontend y Vistas
Árbol de categorías interactivo, catálogo de atributos, configurador de plantillas, wizard de creación de producto con autosave, editor matricial de variantes, gestor de imágenes drag & drop y panel de moderación con checklist.

### 11. APIs Principales
- `POST /catalog/categories`
- `PATCH /catalog/categories/:id`
- `POST /catalog/attributes`
- `POST /catalog/category-rules`
- `POST /catalog/products`
- `GET /catalog/products/:id`
- `PATCH /catalog/products/:id`
- `POST /catalog/products/:id/variants/generate`
- `PATCH /catalog/variants/:id`
- `POST /catalog/products/:id/media`
- `POST /catalog/products/:id/validate`
- `POST /catalog/products/:id/publish`
- `POST /catalog/products/:id/pause`
- `POST /catalog/reindex/:id`

### 12. Validaciones Técnicas Mínimas
Límites de caracteres, normalización y sanitización de texto HTML, validación de extensiones/peso de imágenes, índices únicos en base de datos para SKU/slug y cálculo de checksums de indexación.

### 13. Seguridad y Permisos
- Superadmin: Control total global.
- Admin catálogo: Gestión de taxonomía y aprobación de fichas.
- Seller: CRUD acotado a sus propios productos.
- Moderación: Pausa, rechazo y revisión de contenidos.
- Firmado obligatorio de URLs para subida de media.

### 14. Rendimiento y Escalabilidad
Evitar consultas N+1 en fichas de producto completas, paginación server-side estricta, proyecciones planas para OpenSearch y procesamiento de imágenes fuera del ciclo request-response.

### 15. Integración con Búsqueda
Desacoplar la lectura masiva de PostgreSQL; OpenSearch indexa proyecciones con datos normalizados, badges, facetas y precios vigentes.

### 16. Pruebas Obligatorias
Unitarias sobre generador de matrices y validadores; integración sobre persistencia y colas; E2E del flujo completo desde borrador a indexación; pruebas de carga en actualización masiva de stock.

### 17. Fases de Desarrollo
- Fase 1: Categorías, atributos y reglas taxonómicas.
- Fase 2: Producto maestro y subida de archivos.
- Fase 3: Variantes, SKUs y stock base.
- Fase 4: Flujo de publicación y auditoría.
- Fase 5: Indexación OpenSearch y optimización.

### 18. Definition of Done (DoD)
Taxonomía y reglas operativas, bloqueo de duplicados de variantes, checklist de publicación funcional, sincronización con OpenSearch verificada y suite de tests aprobada en CI.

### 19. Riesgos
Fichas pobres que afecten SEO y conversión, variantes duplicadas por falta de constraints, stock inconsistente y búsquedas lentas por sobrecarga en la base de datos relacional.

### 20. Historias de Usuario Principales
- `HU-201`: Crear categorías jerárquicas.
- `HU-202`: Definir atributos normalizados por categoría.
- `HU-203`: Guardar producto en borrador.
- `HU-204`: Generar variantes matriciales.
- `HU-205`: Validar reglas antes de publicar.
- `HU-206`: Aprobar o rechazar productos como moderador.
- `HU-207`: Reindexación automática ante modificaciones.

### 21. Dependencias del Módulo
Consume usuarios y roles (Módulo 1); alimenta búsqueda (Módulo 3), checkout (Módulo 4) y panel seller (Módulo 8).

---

## Módulo 3: Búsqueda, Discovery, Filtros, Ordenamiento y Recomendaciones

### 1. Propósito del Módulo
Transforma el catálogo de productos en una experiencia fluida de descubrimiento comercial, resolviendo búsquedas por texto libre, navegación taxonómica, facetas dinámicas y algoritmos de recomendación.

### 2. Objetivos Funcionales
- Búsqueda global por texto libre (título, marca, descripción, categoría, SKU).
- Árbol de categorías con conteos reales de resultados.
- Filtros multi-select (precio, disponibilidad, vendedor, condición, atributos).
- Criterios de ordenamiento (relevancia, popularidad, precio, novedad, descuento).
- Autocompletado rápido con tolerancia a errores de tipeo ("quisiste decir").
- Bloques de recomendación contextual en home, PDP, carrito y páginas sin resultados.
- Trazabilidad analítica de consultas, impresiones y clicks.

### 3. Alcance Funcional
Buscador desktop/mobile, páginas de resultados con paginación/infinite scroll, filtros facetados, motor de ranking/boosting comercial, diccionarios de sinónimos, stop-words, indexación incremental y caché Redis.

### 4. Funciones Obligatorias
- Búsqueda ponderada por campos clave.
- Autocompletado con latencia mínima.
- Corrección tipográfica y stemming en español.
- Facetas dinámicas calculadas sobre el set de resultados activos.
- Boosting por disponibilidad de stock, reputación del seller y campañas comerciales.
- Exclusión automática de productos no publicados o bloqueados.
- Recomendaciones de cross-sell, up-sell y productos complementarios.
- Registro analítico de queries vacías para optimización de catálogo.

### 5. Reglas de Negocio Críticas
1. Solo se indexan productos publicados y con visibilidad habilitada.
2. El stock visible debe reflejar disponibilidad real o reglas de reserva.
3. Productos sin precio o datos mínimos obligatorios no rankean.
4. El boosting publicitario no puede violar reglas de seguridad ni estados pausados.
5. Las facetas deben calcularse en tiempo real sobre los resultados devueltos.
6. Toda recomendación debe responder a un algoritmo o regla auditable.
7. Reindexación incremental en segundos tras cambios en el catálogo.

### 6. Flujo Funcional Recomendado
1. Recepción de consulta -> 2. Normalización y corrección de texto -> 3. Resolución de contexto (categoría, canal, filtros) -> 4. Construcción de Query DSL para OpenSearch -> 5. Ejecución, conteos facetados y scoring -> 6. Post-procesamiento y badges -> 7. Renderizado en UI -> 8. Tracking analítico de eventos.

### 7. Frontend y Vistas
Next.js con SSR/ISR para SEO y URLs compartibles (`/buscar?q=...&categoria=...`). Search bar interactivo con sugerencias, panel lateral de facetas, breadcrumbs, chips de filtros activos y skeletons de carga.

### 8. Backend y Servicios
NestJS: `search`, `search-indexing`, `suggestions`, `recommendations`, `ranking-rules`, `search-analytics`, `search-admin`. Adapters dedicados para OpenSearch y Redis.

### 9. Modelo de Datos Técnico
- `search_document`: Esquema de indexación plana en OpenSearch.
- `search_query_log`: Log de queries, tiempos, usuario y resultados devueltos.
- `search_synonym_set`: Diccionarios de equivalencias y sinónimos comerciales.
- `search_rule`: Reglas de boosting, bury, pinning y campañas.
- `recommendation_event`: Métricas de interacción con recomendaciones.
- `indexing_job`: Control de procesos de indexación y reintentos.

### 10. Campos del Documento OpenSearch
`product_id`, `sku_id`, `seller_id`, `category_id`, `brand_id`, `title_search`, `brand_search`, `description_search`, `keywords`, `price_current`, `price_original`, `discount_percent`, `stock_status`, `stock_qty_visible`, `rating_avg`, `seller_score`, `attributes_flat`, `attributes_facetable`, `media_main_url`, `thumbnail_url`.

### 11. APIs Sugeridas
- `GET /search` - Consulta principal de productos con filtros y orden.
- `GET /search/suggestions` - Autocompletado y términos populares.
- `GET /search/facets` - Obtención desacoplada de facetas y conteos.
- `GET /recommendations/home` - Bloques para la página principal.
- `GET /recommendations/product/:id` - Similares y complementarios en PDP.
- `POST /search/events` - Ingesta de eventos de click/impresión.
- `POST /search/reindex/product/:id` - Reindexación incremental.
- `POST /search/reindex/full` - Reindexación administrativa completa.
- `POST /search/rules` - Configuración de reglas de boosting.

### 12. Rendimiento y SLAs
- Búsqueda principal: Promedio < 300 ms (máximo aceptable < 700 ms).
- Autocompletado: < 150 ms.
- Recomendaciones: < 200 ms.
- Uso de Redis para caché de términos frecuentes y alias para reemplazo seguro de índices.

### 13. Seguridad y Controles
Sanitización de queries, rate limiting en búsqueda y sugerencias, protección de reglas comerciales y ocultamiento estricto de márgenes o datos internos en respuestas públicas.

### 14. Testing Mínimo
Tests de integración NestJS-OpenSearch, contract tests, pruebas de carga con queries concurrentes y validación de empty states y filtros en frontend.

### 15. Definition of Done (DoD)
Búsqueda operativa y precisa, facetas con conteos coherentes, autocompletado de baja latencia, reindexación por eventos probada y telemetría de consultas habilitada.

---

## Módulo 4: Carrito, Checkout y Validación de Compra

### 1. Definición del Módulo
El Módulo 4 transforma la intención de compra en una orden válida y preparada para pago. No es una simple pantalla, sino un motor transaccional que consolida productos, precios vigentes, direcciones, fletes preliminares, cupones y validaciones finales.

### 2. Objetivos
- Reducir el abandono mediante una experiencia fluida mobile-first.
- Prevenir pedidos con inconsistencias de stock, precio desactualizado o zonas no atendidas.
- Generar un **Checkout Snapshot** congelado con hash de integridad previo a la pasarela de pagos.
- Separar claramente el carrito (mutable) del checkout (congelado) y de la orden (transaccional).

### 3. Componentes Obligatorios
- **Carrito persistente:** Carrito por usuario registrado y guest cart para visitantes (con merge al autenticarse).
- **Línea de carrito:** Seller, producto, variante, cantidad, precio capturado y moneda.
- **Motor de validación:** Recálculo obligatorio de stock y precio en backend en cada consulta o modificación.
- **Dirección y entrega:** Validación geográfica de domicilio, sucursales y puntos de retiro.
- **Resumen económico:** Desglose estricto de subtotal, descuentos, envío, impuestos y total.
- **Cupones:** Validación de vigencia, límites por usuario y montos mínimos.
- **Checkout Snapshot:** Payload validado e inmutable con vencimiento breve para el intento de pago.

### 4. Reglas de Negocio Críticas
1. El carrito es mutable; el checkout confirmado emite un snapshot congelado con expiración.
2. Todo precio se recalcula en backend; nunca se confía en montos del frontend.
3. Se bloquea el checkout de ítems pausados, eliminados o sin stock vendible.
4. Carritos multi-vendedor se visualizan unificados pero quedan preparados para split de órdenes.
5. Los cupones no se acumulan si las políticas comerciales lo impiden.
6. Cambios en la dirección invalidan y recalculan los costos logísticos.
7. Los snapshots tienen firma o hash de integridad para evitar adulteraciones de precios.

### 5. Flujo Funcional
1. Agregar ítem -> 2. Validación de disponibilidad -> 3. Edición de cantidades y recálculo -> 4. Selección de dirección y entrega -> 5. Aplicación de cupones -> 6. Validación integral del sistema -> 7. Confirmación del comprador -> 8. Generación del snapshot listo para pagos.

### 6. Modelo de Datos Mínimo
- `carts`: `id`, `buyer_id`, `guest_token`, `status`, `currency`, `updated_at`.
- `cart_items`: `id`, `cart_id`, `seller_id`, `product_id`, `sku_id`, `qty`, `unit_price`, `price_source`, `validation_status`.
- `buyer_addresses`: `id`, `buyer_id`, `label`, `street`, `number`, `city`, `province`, `postal_code`, `notes`.
- `cart_coupons`: `id`, `cart_id`, `coupon_code`, `status`, `discount_amount`.
- `checkout_snapshots`: `id`, `cart_id`, `buyer_id`, `totals_json`, `shipping_json`, `expires_at`, `hash`.
- `cart_events`: `id`, `cart_id`, `actor_type`, `event_name`, `payload_json`, `created_at`.

### 7. Endpoints Principales
- `POST /api/cart/items` - Agregar ítem.
- `PATCH /api/cart/items/:id` - Modificar cantidad.
- `DELETE /api/cart/items/:id` - Eliminar ítem.
- `GET /api/cart` - Obtener carrito recalculado.
- `POST /api/cart/merge` - Unificar guest cart con usuario autenticado.
- `GET /api/checkout/context` - Opciones de entrega, direcciones y resumen.
- `POST /api/checkout/address` - Asignar dirección.
- `POST /api/checkout/shipping-method` - Asignar método de entrega.
- `POST /api/checkout/coupon` - Aplicar cupón.
- `DELETE /api/checkout/coupon/:code` - Remover cupón.
- `POST /api/checkout/validate` - Chequeo preventivo de consistencia.
- `POST /api/checkout/snapshot` - Emisión de snapshot con hash para pasarela.

### 8. Testing y Definition of Done
Pruebas de concurrencia y race conditions en stock, pruebas de merge de carritos, cálculo matemático de cupones y expiración de snapshots. La Definition of Done exige checkout seguro y responsivo sin desfasajes de precio.

---

## Módulo 5: Pagos, Autorización, Conciliación y Escrow Ledger

### 1. Definición del Módulo
Administra el ciclo financiero transaccional desde que el comprador confirma el checkout hasta que los fondos quedan autorizados, conciliados, retenidos en escrow o liberados al vendedor. Desacopla la lógica de negocio de las pasarelas externas (Stripe, Mercado Pago, etc.).

### 2. Objetivos y Submódulos
- Orquestación y autorización segura de cobros.
- Idempotencia estricta para prevenir dobles cobros.
- Libro mayor transaccional (Ledger) append-only.
- Escrow para retención de fondos hasta cumplimiento de entrega.
- Submódulos: Orquestador de pagos, Máquina de estados financieros, Conciliación asíncrona por webhooks, Ledger contable, Motor de retenciones/escrow y Módulo de reembolsos/chargebacks.

### 3. Estados Financieros
`created` -> `pending` -> `authorized` -> `approved` -> `reconciled` -> `released`.  
Ramas alternativas: `rejected`, `cancelled`, `refunded`, `partially_refunded`, `chargeback`, `under_review`.

### 4. Reglas Críticas
1. Un solo cobro efectivo por orden (salvo split transaccional explícito).
2. La orden no pasa a pago aprobado sin confirmación fehaciente de pasarela o webhook validado.
3. Todas las transacciones utilizan `Idempotency-Key`.
4. El ledger contable es inmutable (append-only); las correcciones se hacen mediante asientos de compensación.
5. Retención de fondos preventiva si se abre un reclamo o contracargo.

### 5. Modelo de Datos Mínimo
- `payments`: `id`, `order_id`, `amount`, `currency`, `status`, `provider`, `provider_payment_id`.
- `payment_attempts`: `id`, `payment_id`, `status`, `provider_response`, `error_message`.
- `payment_webhooks`: `id`, `provider`, `raw_payload`, `signature`, `processed_at`.
- `financial_ledger_entries`: `id`, `entity_type`, `entity_id`, `type`, `amount`, `balance_after`, `created_at`.
- `escrow_holds`: `id`, `payment_id`, `order_id`, `amount`, `release_at`, `released_at`.
- `refunds`: `id`, `payment_id`, `amount`, `reason`, `status`, `processed_at`.
- `chargebacks`: `id`, `payment_id`, `reason_code`, `status`, `evidence_url`.
- `reconciliation_jobs`: `id`, `provider`, `status`, `discrepancies_found`, `executed_at`.

### 6. APIs Recomendadas
- `POST /payments/intents` - Crear intención de pago.
- `POST /payments/confirm` - Confirmar estado de transacción.
- `POST /payments/webhooks/:provider` - Ingesta de webhooks con firma criptográfica.
- `GET /payments/:id` - Consulta de estado financiero.
- `POST /payments/:id/refund` - Procesar reembolso total o parcial.
- `POST /payments/:id/release` - Liberación manual o programada de escrow.
- `GET /reconciliation/jobs/:id` - Auditoría de conciliación bancaria.

---

## Módulo 6: Órdenes, Post-compra y Lifecycle Operativo del Pedido

### 1. Definición del Módulo
Orquestador del ciclo de vida del pedido desde la confirmación de pago hasta su cierre operativo, logístico y financiero. Administra órdenes maestras y subórdenes multi-vendedor con trazabilidad completa.

### 2. Objetivos y Alcance
- Creación de pedidos inmutables basados en el snapshot transaccional.
- Segmentación por vendedor mediante `order_master` y `order_children`.
- Trazabilidad y timeline visible para comprador, seller y soporte.
- Gestión de incidencias post-compra, cancelaciones y devoluciones.

### 3. Máquina de Estados de la Orden
`created` -> `awaiting_seller_ack` -> `confirmed` -> `preparing` -> `packed` -> `handoff_to_carrier` -> `in_transit` -> `delivered` -> `completed`.  
Excepciones: `rejected_no_stock`, `cancelled`, `delivery_attempt`, `delivery_failed`, `returned`, `disputed`.

### 4. Reglas de Negocio Críticas
1. La orden no se crea definitivamente sin pago autorizado o pendiente controlado.
2. Los datos comerciales quedan congelados en un snapshot inmutable.
3. Las cancelaciones y despachos pueden ser parciales por vendedor sin corromper la orden maestra.
4. Fondos retenidos hasta el cumplimiento de la entrega y la ventana antifraude.
5. Cada transición de estado debe registrar actor, motivo y timestamp.
6. Reintentos de jobs asíncronos gobernados por idempotencia.

### 5. Modelo de Datos Mínimo
- `orders`: `id`, `buyer_id`, `currency`, `total_amount`, `payment_status`, `global_status`, `created_at`, `completed_at`.
- `order_children`: `id`, `order_master_id`, `seller_id`, `fulfillment_mode`, `shipping_method`, `operational_status`, `sla_deadline`.
- `order_items`: `id`, `child_order_id`, `product_id_snapshot`, `sku_snapshot`, `qty`, `unit_price_snapshot`, `subtotal_snapshot`.
- `order_addresses`: `id`, `order_id`, `receiver_name`, `phone`, `province`, `city`, `postal_code`, `street`, `geo_snapshot`.
- `order_timeline_events`: `id`, `order_id`, `child_order_id`, `event_type`, `actor_type`, `actor_id`, `metadata_json`, `occurred_at`.
- `order_status_history`: `id`, `order_id`, `from_status`, `to_status`, `reason_code`, `correlation_id`.
- `order_incidents`: `id`, `child_order_id`, `type`, `severity`, `owner_team`, `current_status`, `resolution_type`.
- `order_documents`: `id`, `order_id`, `invoice_ref`, `shipping_label_ref`, `packing_list_ref`.

### 6. APIs Sugeridas
- `POST /orders/from-checkout` - Creación de orden desde snapshot aprobado.
- `GET /orders/:id` - Detalle consolidado.
- `GET /orders/:id/timeline` - Timeline auditable.
- `GET /buyer/orders` - Pedidos del comprador autenticado.
- `GET /seller/orders` - Bandeja de pedidos del vendedor.
- `POST /seller/orders/:id/confirm` - Aceptación de suborden por el seller.
- `POST /seller/orders/:id/prepare` - Marcado de inicio de preparación.
- `POST /seller/orders/:id/dispatch` - Confirmación de despacho o entrega al carrier.
- `POST /orders/:id/cancel` - Solicitud de cancelación.
- `POST /orders/:id/incidents` - Apertura de disputa o reclamo.
- `POST /orders/:id/confirm-delivery` - Confirmación de recepción.

---

## Módulo 7: Logística, Envíos, Tracking, SLA e Incidencias

### 1. Definición del Módulo
Coordina el fulfillment end-to-end: promesa de entrega, cotización de flete, emisión de etiquetas, manifiestos de retiro, integración con transportistas, tracking dinámico, control de SLAs y resolución de excepciones de entrega.

### 2. Estados Logísticos
`pendiente_preparacion` -> `en_preparacion` -> `lista_para_despacho` -> `despachado` -> `en_transito` -> `en_reparto` -> `entregado`.  
Estados de excepción: `intento_fallido`, `incidencia`, `devuelto_origen`, `reverse_closed`.

### 3. Reglas de Negocio Críticas
1. No se marca un pedido como despachado sin un `shipment` válido y etiqueta emitida.
2. Las promesas de entrega consideran días hábiles, corte horario (cutoff) y feriados.
3. Soporta múltiples bultos y envíos independientes para pedidos multi-vendedor.
4. Ingesta de webhooks de carriers con validación de secuencia e idempotencia.
5. La confirmación de entrega requiere comprobante o prueba de entrega (POD: firma, foto o geolocalización).

### 4. Modelo de Datos Mínimo
- `shipments`: `id`, `suborder_id`, `carrier_id`, `service_code`, `origin_id`, `destination_snapshot`, `promised_min_at`, `promised_max_at`, `current_status`, `tracking_code`, `label_url`, `eta_current`, `delivered_at`.
- `shipment_packages`: `id`, `shipment_id`, `package_number`, `weight_declared`, `weight_real`, `dimensions`, `barcode`.
- `shipment_events`: `id`, `shipment_id`, `external_event_code`, `event_type`, `event_at`, `location_text`, `payload_json`, `is_customer_visible`.
- `shipping_rate_snapshot`: `id`, `order_context`, `cost_buyer`, `cost_seller`, `sla_days_min`, `sla_days_max`, `method_code`.
- `logistics_incidents`: `id`, `shipment_id`, `incident_type`, `severity`, `status`, `resolution_summary`.
- `proof_of_delivery`: `id`, `shipment_id`, `delivered_at`, `receiver_name`, `signature_url`, `photo_url`, `geolocation`.

### 5. APIs Sugeridas
- `POST /shipping/quote` - Cotización de costo y promesa de entrega.
- `POST /shipping/shipments` - Creación de envío a partir de suborden.
- `POST /shipping/shipments/:id/label` - Emisión o descarga de etiqueta.
- `POST /shipping/shipments/:id/pickup` - Solicitud de recolección al transportista.
- `GET /shipping/shipments/:id` - Detalle operativo del envío.
- `GET /shipping/shipments/:id/tracking` - Historial cronológico de seguimiento.
- `POST /shipping/webhooks/:carrier` - Ingesta de eventos de tracking externos.
- `POST /shipping/incidents` - Registro de incidencia logística.
- `POST /shipping/incidents/:id/resolve` - Cierre o resolución de incidencia.

---

## Módulo 8: Panel Vendedor, Gestión Operativa del Seller y Performance

### 1. Definición del Módulo
Constituye el sistema operativo comercial del vendedor. Centraliza el catálogo propio, inventario, precios, subórdenes asignadas, atención de preguntas y reclamos, métricas de conversión y administración de colaboradores internos.

### 2. Funciones Obligatorias
- Dashboard con KPIs de ventas, publicaciones pausadas, pedidos críticos y SLA.
- CRUD y gestión masiva de productos y variantes dentro de su propio ámbito (scope).
- Control de stock disponible, comprometido y umbrales mínimos.
- Gestión de precios base y ofertas temporales.
- Despacho y preparación de pedidos asignados.
- Mensajería pre-venta y post-venta con compradores.
- Gestión de reclamos y solicitudes de devolución.
- Gestión de reputación y respuestas a valoraciones de clientes.
- Control de usuarios internos con RBAC a nivel de tienda.

### 3. Matriz de Roles Internos del Seller
| Rol | Permisos |
| :--- | :--- |
| **Owner** | Control total de la cuenta vendedor y gestión comercial. |
| **Administrador** | Operación integral de la tienda (excepto cobros/billetera restringida). |
| **Operador Catálogo** | Creación y actualización de productos, stock y precios. |
| **Operador Logística** | Preparación de paquetes, impresión de etiquetas y estados de despacho. |
| **Atención Comercial**| Respuesta a mensajes de compradores, atención de dudas y reclamos. |
| **Analista** | Lectura de reportes y métricas de desempeño sin permisos destructivos. |

### 4. Modelo de Datos Mínimo
- `seller_account`: Identificador de tienda, razón social, CUIT/RUT y estado.
- `seller_user`: Usuarios vinculados a una o varias cuentas seller.
- `seller_role` y `seller_permission`: Matriz de permisos de la tienda.
- `seller_store_profile`: Configuración visual, horarios de atención y políticas comerciales.
- `seller_dashboard_snapshot`: Caché agregada de indicadores de ventas y métricas.
- `seller_stock_ledger`: Bitácora histórica de modificaciones de stock.
- `seller_message_thread`: Hilos de mensajería con compradores.
- `seller_incident_case`: Casos de disputas y devoluciones en curso.

### 5. APIs Principales
- `GET /seller/dashboard/summary`
- `GET /seller/products` / `POST /seller/products` / `PATCH /seller/products/:id`
- `POST /seller/products/bulk-update`
- `GET /seller/orders` / `POST /seller/orders/:id/acknowledge` / `POST /seller/orders/:id/ready-to-ship`
- `GET /seller/messages` / `POST /seller/messages/:threadId/reply`
- `GET /seller/reports/sales` / `POST /seller/reports/export`
- `GET /seller/settings/store` / `PATCH /seller/settings/store`
- `GET /seller/team/users` / `POST /seller/team/users`

---

## Módulo 9: CRM, Leads, Automatización Comercial, Scoring y Trazabilidad Omnicanal

### 1. Definición del Módulo
Gestiona la relación comercial end-to-end con prospectos y clientes. Captura leads de canales digitales (WhatsApp, landings, campañas, formularios, búsquedas internas), unifica identidades, aplica scoring de conversión y ejecuta automatizaciones de seguimiento sin perder atribución.

### 2. Funciones Obligatorias
- Captura multicanal y deduplicación determinística de leads.
- Ficha 360 de contactos y cuentas comerciales.
- Gestión de oportunidades con pipelines y etapas personalizables.
- Motor de scoring comercial por comportamiento, perfil e interacción.
- Automatizaciones con disparadores por eventos (recordatorios, reasignaciones por inactividad, secuencias de nutrición).
- Control estricto de consentimiento de contacto y políticas de privacidad.
- Registro de tareas, agenda y alertas de SLA de atención.

### 3. Entidades del Dominio
- `lead`: Registro inicial previo a calificación.
- `contact`: Persona con identidad unificada y trazabilidad.
- `account`: Empresa u organización vinculada a contactos.
- `opportunity`: Trato comercial con valor estimado, probabilidad y etapa.
- `pipeline` y `pipeline_stage`: Estructura del embudo de ventas.
- `activity`: Registro de llamadas, mensajes, notas, reuniones o tareas.
- `automation_rule` y `automation_run`: Definición y ejecuciones de flujos automáticos.
- `lead_score_snapshot`: Puntuación actual y factores explicativos del score.
- `consent_record`: Evidencia de consentimiento de mensajería por canal.

### 4. APIs Principales
- `POST /crm/leads` - Ingesta de prospectos.
- `GET /crm/leads` - Listado con filtros y paginación.
- `POST /crm/leads/:id/assign` - Asignación a vendedor o equipo.
- `POST /crm/leads/:id/qualify` - Conversión de lead a contacto/oportunidad.
- `POST /crm/contacts/merge` - Fusión de identidades duplicadas.
- `GET /crm/contacts/:id/timeline` - Historial cronológico unificado.
- `POST /crm/opportunities` / `PATCH /crm/opportunities/:id/stage` - Gestión de embudo.
- `POST /crm/automation-rules` - Definición de reglas automáticas.
- `GET /crm/reports/funnel` / `GET /crm/reports/sla` - Reportes comerciales.

---

## Módulo 10: Community Manager, Bandeja Omnicanal, Campañas y Respuestas Asistidas

### 1. Definición del Módulo
Centraliza la comunicación conversacional en una sola bandeja unificada. Permite la operación multiagente para WhatsApp Business, Instagram Direct, Facebook Messenger, correo electrónico y webchat, asistida por IA generativa para responder consultas frecuentes y asociar interacciones a ventas reales.

### 2. Funciones Obligatorias
- Bandeja omnicanal agrupada por canal, estado, prioridad y tienda.
- Estados de conversación: `new`, `open`, `assigned`, `pending_customer`, `pending_internal`, `resolved`, `archived`.
- Control de SLAs de primera respuesta y tiempo total de resolución.
- Envío y programación de campañas comerciales segmentadas con plantillas aprobadas.
- Respuestas asistidas por IA con conocimiento del catálogo, stock y políticas del marketplace.
- Escalamiento automático a agentes humanos ante señales de riesgo, quejas o compras complejas.

### 3. Modelo de Datos Mínimo
- `conversations`: `id`, `channel`, `status`, `assigned_user_id`, `customer_id`, `seller_id`, `created_at`.
- `conversation_participants`: `conversation_id`, `actor_type`, `actor_id`.
- `messages`: `id`, `conversation_id`, `sender_type`, `body`, `attachments_json`, `created_at`.
- `campaign_definitions`: `id`, `name`, `channel`, `template_id`, `status`.
- `campaign_runs`: `id`, `campaign_id`, `sent_count`, `delivered_count`, `read_count`, `click_count`.
- `suggested_replies`: `id`, `conversation_id`, `prompt_context`, `generated_text`, `accepted_flag`.
- `sla_events`: `id`, `conversation_id`, `metric_type`, `target_seconds`, `actual_seconds`, `breached_flag`.

### 4. APIs Recomendadas
- `GET /conversations` - Bandeja de entrada.
- `POST /conversations/:id/assign` - Asignar chat a operador.
- `POST /conversations/:id/reply` - Responder mensaje.
- `POST /campaigns` - Crear campaña de difusión.
- `POST /campaigns/:id/send` - Disparar envío masivo.
- `GET /campaigns/:id/metrics` - Métricas de apertura y clicks.
- `POST /ai/reply-suggestions` - Generar sugerencia de respuesta asistida.

---

## Módulo 11: Live Shopping, Streaming Interactivo, Productos en Vivo y Ofertas en Tiempo Real

### 1. Definición del Módulo
Capa especializada de comercio en vivo. Orquesta salas de streaming de ultra-baja latencia (AWS IVS / WebRTC) sincronizadas con catálogo interactivo, chat moderado en tiempo real, productos pineados en pantalla, cupones con temporizador (countdowns) y checkout directo con atribución comercial.

### 2. Funciones Obligatorias
- Programación, configuración de hosts y publicación de eventos en vivo.
- Sala interactiva con reproductor de video, chat en vivo, contador de audiencia y CTA de compra.
- Catálogo del live con precios especiales y control de stock visible sin sobreventa.
- Pin de productos en pantalla sincronizado con el discurso del presentador.
- Moderación de chat: filtros anti-spam, bloqueo de palabras prohibidas y expulsión de infractores.
- Ofertas flash con cuenta regresiva vinculadas a la transmisión.
- Atribución de ventas: seguimiento de impresiones, clicks, add-to-cart y compras por evento.
- Soporte para grabación de video y publicación de repeticiones (replays) comerciales.

### 3. Modelo de Datos Mínimo
- `live_events`: `id`, `seller_id`, `host_id`, `title`, `slug`, `status`, `scheduled_start_at`, `scheduled_end_at`.
- `live_stream_sessions`: `id`, `live_event_id`, `provider`, `playback_url`, `stream_status`, `started_at`, `ended_at`.
- `live_event_products`: `id`, `live_event_id`, `product_id`, `variant_id`, `sort_order`, `live_price`, `stock_snapshot`.
- `live_pin_events`: `id`, `live_event_id`, `product_id`, `pinned_at`, `unpinned_at`, `cta_label`.
- `live_offers`: `id`, `live_event_id`, `product_id`, `discount_type`, `discount_value`, `starts_at`, `ends_at`.
- `live_chat_messages`: `id`, `live_event_id`, `viewer_id`, `body`, `moderation_status`, `created_at`.
- `live_view_sessions`: `id`, `live_event_id`, `viewer_id`, `source`, `device_type`, `entered_at`, `exited_at`.
- `live_conversion_events`: `id`, `live_event_id`, `viewer_session_id`, `event_type`, `product_id`, `order_id`, `amount`.

### 4. APIs Principales
- `POST /live/events` / `PATCH /live/events/:id` / `POST /live/events/:id/publish`
- `POST /live/events/:id/start` / `POST /live/events/:id/end`
- `POST /live/events/:id/products` - Asociar catálogo a la transmisión.
- `POST /live/events/:id/pin-product` - Fijar producto en video.
- `POST /live/events/:id/offers` - Activar oferta por tiempo limitado.
- `GET /live/events/:id/room` - Datos de la sala para el espectador.
- `POST /live/events/:id/chat/messages` - Publicar mensaje.
- `POST /live/events/:id/chat/moderate` - Acción de moderación de chat.
- `GET /live/events/:id/metrics` - Estadísticas y ventas en tiempo real.

---

## Módulo 12: Seguridad, Anti-fraude, KYC/KYB y Control de Confianza

### 1. Definición del Módulo
Capa transversal de seguridad operativa, confianza y mitigación de fraude. Abarca autenticación multifactor (2FA), verificación de identidad documental y biométrica (KYC personas / KYB empresas), scoring de riesgo determinístico y por machine learning, listas de bloqueo globales y panel de investigación de casos de fraude.

### 2. Submódulos Obligatorios
- Identidad y onboarding seguro (device fingerprint, validación OTP, control de reputación inicial).
- Integración con proveedores externos de KYC/KYB (prueba de vida, reconocimiento facial, listas AML/PEP, validación fiscal).
- Seguridad de acceso (2FA obligatorio para sellers/admins, rotación de tokens, control de IP).
- Motor de riesgo (reglas en tiempo real, scoring de transacciones y explicabilidad).
- Monitoreo transaccional (detección de robo de cuentas, autofraude, abuso de cupones y triangulación).
- Case management (cola de revisión humana, evidencia, notas internas y apelaciones).
- Auditoría forense inmutable.

### 3. Niveles de Verificación y Estados
- **Nivel 0:** Invitado (navegación básica sin compras sensibles).
- **Nivel 1:** Verificación básica de contacto (Email y Teléfono por OTP).
- **Nivel 2:** KYC Persona Natural (Documento de identidad nacional + selfie con prueba de vida).
- **Nivel 3:** KYB Persona Jurídica (Estatutos societarios, número de identificación fiscal, comprobante de facultades del apoderado).
- **Nivel 4:** KYC+ Comercial (Comprobantes de ingresos o referencias bancarias para sellers de gran volumen).
- Estados de KYC: `pending` -> `in_review` -> `verified` -> `expired` (rama: `rejected`).
- Estados de Cuenta: `active`, `challenged`, `limited`, `suspended`, `blocked`.

### 4. Modelo de Datos Mínimo
- `security_profile`: Perfil consolidado de riesgo por actor.
- `device_fingerprint`: Registro técnico de dispositivos y vínculos con múltiples cuentas.
- `risk_event`: Eventos transaccionales evaluados por el motor de riesgo.
- `risk_rule`: Reglas activas, umbrales y versiones sin necesidad de nuevo despliegue.
- `risk_decision`: Resultado de evaluación (`allow`, `challenge`, `review`, `block`).
- `kyc_verification`: Registro de verificación y respuesta normalizada de proveedores externos.
- `blocklist_entry`: Listas de bloqueo por documento, IP, teléfono, email, cuenta bancaria o tarjeta.
- `fraud_case`: Caso asignado a analistas con prioridad, estado y resolución.
- `fraud_case_evidence`: Documentos, capturas y snapshots de soporte legal.
- `security_audit_log`: Bitácora inmutable de eventos y decisiones de seguridad.

### 5. APIs Principales
- `POST /auth/challenge/2fa`
- `POST /security/kyc/start` / `GET /security/kyc/status/:actorId`
- `POST /risk/evaluate` / `GET /risk/profile/:actorId`
- `POST /risk/blocklist`
- `POST /fraud-cases` / `PATCH /fraud-cases/:caseId/assign` / `PATCH /fraud-cases/:caseId/resolve`
- `GET /audit/security-events`

---

## Módulo 13: Búsqueda Inteligente, Recomendador, Capa IA, Ranking Semántico y Asistentes de Decisión

### 1. Definición del Módulo
Potencia el motor de búsqueda estándar mediante técnicas de inteligencia artificial y machine learning: búsqueda vectorial semántica mediante embeddings, ranking híbrido léxico-semántico, modelos de recomendación conductual y asistentes virtuales de compra.

### 2. Funciones Obligatorias
- **Ranking híbrido:** Combinación de relevancia léxica (OpenSearch BM25) con distancia semántica vectorial (k-NN embeddings), combinados con popularidad, stock y conversión.
- **Mecanismo de degradación (fallback):** Si los servicios de inferencia IA presentan fallos o latencia elevada, el sistema degrada automáticamente a búsqueda léxica estándar sin interrumpir la experiencia de usuario.
- **Motor de recomendaciones:** Similares, complementarios, vistos recientemente, productos en tendencia y personalizaciones por sesión.
- **Asistente de compra (copiloto):** Chatbot conversacional para comparar fichas técnicas, aclarar dudas de compatibilidad y guiar la decisión de compra basándose estrictamente en datos del catálogo (Grounding / RAG) sin alucinaciones.

### 3. Modelo de Datos Mínimo
- Índices OpenSearch con vectores denso-semánticos (`knn_vector`).
- `recommendation_impressions` y `recommendation_clicks`: Interacciones con recomendaciones.
- `feature_snapshots`: Características de usuarios y productos para inferencia.
- `ai_sessions` y `ai_messages`: Historial y contexto de interacciones con el asistente conversacional.
- `ranking_experiments`: Configuración de pruebas A/B para algoritmos de ranking.
- `semantic_jobs`: Tareas asíncronas de generación de embeddings para nuevos productos.

### 4. APIs Principales
- `POST /search/intelligent` - Búsqueda semántica híbrida.
- `GET /recommendations/home` - Recomendaciones generales o personalizadas para la home.
- `GET /recommendations/product/:id` - Productos relacionados y complementarios en PDP.
- `POST /ai/assistant` - Consulta conversacional contextualizada al catálogo.
- `POST /ranking/feedback` - Retroalimentación explícita o implícita de relevancia.
- `GET /experiments/:id/metrics` - Desempeño comercial de variantes de ranking A/B.

---

## Módulo 14: Archivos, Fotos, Documentos KYC, Media Storage y Gestión de Assets

### 1. Definición del Módulo
Capa centralizada de almacenamiento, validación, procesamiento y distribución de archivos: imágenes de productos, videos de live shopping, fichas técnicas en PDF, documentos de identidad para KYC, contratos comerciales y adjuntos de soporte.

### 2. Funciones Obligatorias
- Emisión de **Presigned URLs** para carga directa desde el cliente al bucket S3/R2, evitando saturar el backend.
- Validación obligatoria post-subida: verificación de tipo MIME real mediante encabezados mágicos (magic bytes), tamaño máximo y escaneo antivirus asíncrono.
- Procesamiento asíncrono con Redis/BullMQ: generación de miniaturas (thumbnails), compresión WebP/AVIF y extracción de metadatos de imágenes y documentos.
- Políticas de acceso diferenciadas: archivos públicos con distribución global por CDN y documentos privados (KYC, contratos) accesibles exclusivamente mediante URLs firmadas de corta caducidad.
- Versionado lógico de archivos y ciclo de vida (borrado lógico, retención y purga definitiva).

### 3. Estados del Asset
`pending` -> `uploaded` -> `scanning` -> `active`.  
Ramas de error: `quarantined`, `rejected`, `archived`, `deleted`.

### 4. Modelo de Datos Mínimo
- `asset`:
  - `id`: Identificador único (UUID).
  - `owner_type`: Tipo de dueño (`seller`, `user`, `system`).
  - `owner_id`: ID de la entidad propietaria.
  - `context`: Propósito (`product_image`, `kyc_doc`, `support_attachment`, etc.).
  - `storage_bucket`: Bucket físico asignado.
  - `storage_key`: Ruta interna del objeto.
  - `mime_type`: Formato MIME verificado.
  - `file_size_bytes`: Tamaño en bytes.
  - `checksum_sha256`: Hash criptográfico para validación y deduplicación.
  - `visibility`: Nivel de visibilidad (`public`, `private`, `restricted`).
  - `status`: Estado del ciclo de procesamiento.
  - `version`: Número de versión del archivo.
  - `is_primary`: Indicador de asset principal.
  - `metadata_json`: Metadatos técnicos (dimensiones, páginas, resolución).
  - `created_by` y `created_at`: Trazabilidad y fecha de creación.
- Tablas complementarias: `asset_variant`, `asset_access_log`, `asset_scan_result`, `asset_retention_rule`.

### 5. APIs Principales
- `POST /assets/upload-sessions` - Iniciar carga y recibir Presigned URL.
- `POST /assets/confirm` - Confirmar subida y disparar workers de escaneo.
- `GET /assets/:id` - Consultar metadatos y estado del archivo.
- `GET /assets/:id/download-url` - Obtener URL firmada de descarga temporal.
- `POST /assets/:id/replace` - Reemplazar archivo generando una nueva versión.
- `PATCH /assets/:id` - Actualizar metadatos, orden o designar imagen principal.
- `DELETE /assets/:id` - Baja lógica del asset.
- `POST /admin/assets/:id/quarantine` - Bloqueo y aislamiento manual por seguridad.

---

## Módulo 15: Administración, Backoffice, Auditoría, Soporte Operativo, Configuración Global y Control de Plataforma

### 1. Definición del Módulo
Consola central de control operativo y gobierno del marketplace. Proporciona a los equipos internos (administradores, operadores de soporte, analistas de riesgo, finanzas y moderadores) las herramientas para gestionar usuarios, revisar casos de KYC, intervenir órdenes y pagos, resolver tickets, configurar parámetros de plataforma y auditar acciones sensibles con total trazabilidad.

### 2. Funciones Obligatorias
- Dashboard con KPIs operativos en tiempo real (órdenes abiertas, pagos observados, reclamos, alertas de riesgo).
- Buscador administrativo universal por usuario, vendedor, ID de orden, pago, envío o ticket de soporte.
- Vista 360 consolidada de clientes y vendedores (historial de compras, ventas, disputas, balances y reputación).
- Suspensión, reactivación o limitación de cuentas con registro obligatorio de justificativo.
- Centro de aprobación o rechazo manual de verificaciones KYC/KYB.
- Intervención y anulaciones controladas sobre órdenes y transacciones financieras (holds, releases, reembolsos manuales).
- Sistema de tickets de soporte interno y externo con seguimiento estricto de SLAs.
- Gestión de parámetros globales (categorías maestras, tablas de comisiones, políticas de retención, causales de anulación) y **Feature Flags** operativas.
- Registro inmutable de acciones administrativas con snapshots del estado previo y posterior (`before_snapshot` / `after_snapshot`).

### 3. Matriz de Roles del Backoffice
| Rol | Ámbito y Nivel de Acceso |
| :--- | :--- |
| **Super Admin** | Control absoluto del sistema, administración de roles internos y configuraciones críticas. |
| **Administrador Operativo** | Gestión de usuarios, comercios, colas de moderación y tickets operativos. |
| **Analista de Riesgo** | Acceso a casos de fraude, verificaciones KYC/KYB y gestión de listas de bloqueo. |
| **Analista de Pagos** | Monitoreo de conciliación bancaria, liberación de retenciones (holds) y liquidaciones. |
| **Soporte Nivel 1** | Visualización de consultas de clientes y acciones básicas de asistencia. |
| **Soporte Nivel 2 / Supervisor** | Intervención avanzada sobre órdenes, anulaciones y resolución de disputas complejas. |
| **Moderador de Catálogo** | Aprobación, rechazo o pausado de publicaciones y revisión de material multimedia. |
| **Auditor Interno** | Acceso de solo lectura a registros forenses, reportes y métricas de cumplimiento. |

### 4. Modelo de Datos Mínimo
- `admin_users`: Identidad del operador, MFA obligatorio, área y nivel de acceso.
- `admin_roles` y `admin_permissions`: Matriz de control de acceso basada en roles (RBAC).
- `admin_sessions`: Registro de sesiones administrativas con control de IP y anomalías.
- `tickets`: Solicitudes de soporte con prioridad, tipo, fecha límite según SLA y responsable.
- `ticket_messages` y `ticket_notes`: Historial de mensajes y notas internas confidenciales.
- `admin_actions_log`: Bitácora inmutable de auditoría con actor, recurso, acción, motivo y cambios (`before_json` / `after_json`).
- `platform_settings`: Configuraciones globales versionadas de la plataforma.
- `feature_flags`: Indicadores para habilitación progresiva de funcionalidades por entorno.
- `review_queues`: Colas de trabajo para casos de riesgo, moderación o soporte.
- `exports_jobs`: Control de exportaciones masivas de datos con permisos y enlaces temporales.

### 5. APIs Principales
- `GET /admin/dashboard/overview` - KPIs e indicadores operativos generales.
- `GET /admin/search?q=` - Búsqueda global administrativa.
- `GET /admin/users/:id` / `POST /admin/users/:id/suspend` / `POST /admin/users/:id/reactivate`
- `GET /admin/sellers/:id` / `POST /admin/sellers/:id/status-action`
- `GET /admin/orders/:id` / `POST /admin/orders/:id/manual-action`
- `GET /admin/payments/:id` / `POST /admin/payments/:id/review-action`
- `GET /admin/tickets` / `POST /admin/tickets` / `POST /admin/tickets/:id/assign` / `POST /admin/tickets/:id/note`
- `GET /admin/settings` / `PUT /admin/settings/:key`
- `GET /admin/audit-log` - Consulta de bitácora forense de operaciones.
- `POST /admin/exports` - Generación asíncrona de reportes protegidos.

---

## Matriz Resumida de Tecnologías y Responsabilidades por Módulo

| Módulo | Dominio Principal | Frontend | Backend | Base de Datos / Storage | Servicios Críticos |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | Usuarios, Auth & Onboarding | Next.js | NestJS | PostgreSQL + Redis | OTP (SMS/WhatsApp), JWT Provider |
| **2** | Catálogo, Productos & Variantes | Next.js | NestJS | PostgreSQL + Redis | OpenSearch (Proyección) |
| **3** | Búsqueda, Filtros & Discovery | Next.js | NestJS | OpenSearch + Redis | Cache de Queries, Scoring Engine |
| **4** | Carrito, Checkout & Snapshot | Next.js | NestJS | PostgreSQL + Redis | Snapshot Signer, Totals Calculator |
| **5** | Pagos, Ledger & Escrow | Next.js | NestJS | PostgreSQL | Pasarelas de Pago, Webhook Verifier |
| **6** | Órdenes & Lifecycle | Next.js | NestJS | PostgreSQL + Redis | State Machine, Event Notifier |
| **7** | Logística, Envíos & Tracking | Next.js | NestJS | PostgreSQL + Redis | APIs de Transportistas, Label Generator |
| **8** | Panel Vendedor (Seller) | Next.js | NestJS | PostgreSQL + OpenSearch | Bulk Inventory Processor |
| **9** | CRM, Leads & Automatización | Next.js | NestJS | PostgreSQL + Redis | Rule Engine, Omnichannel Webhooks |
| **10** | Community Manager & Inbox | Next.js | NestJS | PostgreSQL + Redis | WhatsApp Business API, AI Assistant |
| **11** | Live Shopping & Streaming | Next.js | NestJS | PostgreSQL + Redis | AWS IVS, WebSockets / SSE |
| **12** | Seguridad, KYC/KYB & Antifraude| Next.js | NestJS | PostgreSQL + R2 | Proveedor KYC/KYB, Risk Engine |
| **13** | Búsqueda Inteligente & Capa IA | Next.js | NestJS | OpenSearch + Redis | Vector Embeddings, LLM Provider |
| **14** | Media Storage & Assets | Next.js | NestJS | Cloudflare R2 + PostgreSQL | Workers BullMQ, ClamAV Antivirus |
| **15** | Backoffice & Administración | Next.js | NestJS | PostgreSQL + Redis | Audit Logger, Feature Flag Engine |

---

*Fin del Documento Maestro Consolidado de Arquitectura - SimpleMarketplace360*
