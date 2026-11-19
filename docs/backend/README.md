# Backend de Yomio

API REST stateless de Yomio, construida con Java 21 y Spring Boot 4.1. Gestiona autenticación, catálogo, seguimiento, comunidad, notas, valoraciones y recomendaciones sobre PostgreSQL.

## Requisitos

- JDK 21.
- PostgreSQL 16.
- Maven no es obligatorio: el repositorio incluye Maven Wrapper.

## Arranque local

Desde la raíz del repositorio, inicia PostgreSQL:

```powershell
docker compose up -d postgres
```

Copia `.env.example` como `.env` y añade o ajusta estas variables para ejecutar la API fuera de Docker:

```dotenv
DB_URL=jdbc:postgresql://localhost:55432/tracker
DB_USERNAME=yomio
DB_PASSWORD=el-mismo-valor-de-POSTGRES_PASSWORD
JWT_SECRET=un-secreto-aleatorio-de-al-menos-32-bytes
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Después ejecuta:

```powershell
./mvnw.cmd spring-boot:run
```

En Linux o macOS usa `./mvnw spring-boot:run`. Por defecto, la API escucha en `http://localhost:8080` y el estado básico está en `GET /actuator/health`.

## Arquitectura

El código se encuentra en `src/main/java/com/code/DayTracker` y mantiene una arquitectura por capas:

```text
controllers  →  services  →  repositories  →  PostgreSQL
     ↓              ↓
    dto      models / integrations
```

- `controllers`: límites HTTP bajo `/api` y validación de DTOs.
- `services`: reglas de negocio, ownership y coordinación de operaciones.
- `repositories`: acceso JPA; las consultas privadas deben incluir al propietario.
- `dto`: contratos de entrada y salida; las entidades JPA no deben cruzar el límite HTTP.
- `security`: JWT, usuarios de Spring Security y rate limiting.
- `config`: CORS, seguridad HTTP, clientes y configuración transversal.
- `exceptions`: traducción centralizada de errores a respuestas JSON.
- `integrations`: clientes aislados para AniList, Kitsu y MangaDex.

La autenticación es stateless. El usuario se obtiene del contexto autenticado y nunca de un `userId` enviado por el cliente.

## Superficie de la API

| Ruta base | Responsabilidad | Acceso |
| --- | --- | --- |
| `/api/auth` | Registro, login, renovación y recuperación de contraseña | Público, salvo renovación |
| `/api/account` | Perfil y eliminación de cuenta | Autenticado |
| `/api/catalog` | Consulta y detalle del catálogo | Lectura pública |
| `/api/catalog/refresh*` | Actualización del catálogo | `ADMIN` |
| `/api/tracks` | Seguimiento de obras y progreso | Autenticado |
| `/api/wishlist` | Pendientes y transición a seguimiento | Autenticado |
| `/api/media/{mediaId}` | Notas, valoraciones y tendencias | Autenticado |
| `/api/community` | Comentarios, reacciones y reportes | Autenticado |
| `/api/recommendations` | Recomendaciones y preferencias | Autenticado |
| `/actuator/health` | Salud sin detalles internos | Público |
| `/actuator/*` | Métricas y otros endpoints expuestos | `ADMIN` |

Esta tabla resume grupos de endpoints; los contratos concretos viven en los controladores y DTOs. No se publica todavía una especificación OpenAPI.

## Configuración

Spring carga de forma opcional el archivo `.env` de la raíz. Las variables principales son:

| Variable | Obligatoria | Uso / valor predeterminado |
| --- | --- | --- |
| `DB_URL` | Sí | URL JDBC de PostgreSQL |
| `DB_USERNAME` | Sí | Usuario de aplicación |
| `DB_PASSWORD` | Sí | Contraseña de base de datos |
| `JWT_SECRET` | Sí | Firma JWT; mínimo 32 bytes |
| `SERVER_PORT` | No | `8080` |
| `JWT_EXPIRATION_MS` | No | `7200000` (2 horas) |
| `CORS_ALLOWED_ORIGINS` | No | Orígenes locales de Vite |
| `HIBERNATE_DDL_AUTO` | No | `update`; requiere endurecimiento antes de producción |
| `RATE_LIMIT_ENABLED` | No | `true` |
| `RATE_LIMIT_GENERAL_PER_MINUTE` | No | `120` |
| `RATE_LIMIT_AUTH_PER_MINUTE` | No | `10` |
| `PASSWORD_RESET_SMTP_ENABLED` | No | `false` |
| `PASSWORD_RESET_FROM` | Si SMTP está activo | Remitente de recuperación |
| `PASSWORD_RESET_BASE_URL` | No | URL web para restablecer contraseña |
| `SPRING_MAIL_*` | Si SMTP está activo | Conexión con el proveedor de correo |

`application.properties` también expone opciones `CATALOG_*`, `ANILIST_*` y `KITSU_*` para programar y limitar las sincronizaciones externas.

## Persistencia y migraciones

Flyway ejecuta los scripts de `src/main/resources/db/migration`. Toda modificación del modelo persistente debe incluir una migración SQL reproducible.

El valor actual por defecto es `spring.jpa.hibernate.ddl-auto=update`. Antes de usar `validate` sobre una base vacía es necesario completar una migración base; las migraciones presentes son incrementales y parten del esquema histórico. No cambies este comportamiento en producción sin resolver primero esa línea base.

Los scripts operativos de `ops` incluyen backup, restauración y una propuesta de permisos mínimos para PostgreSQL.

## Seguridad

- JWT Bearer y BCrypt; no se usan sesiones de servidor.
- CORS explícito y configurable.
- Registro público limitado al rol `USER`.
- Recursos privados filtrados por propietario en servicios y repositorios.
- Límites de peticiones distintos para autenticación y tráfico general.
- Errores JSON con `X-Request-Id`, sin cuerpos, tokens ni detalles internos en logs.
- Salud pública sin detalles; métricas de Prometheus restringidas a administración.
- Los tokens de recuperación se almacenan como hash, caducan y son de un solo uso.

El rate limit es local al proceso. Para ejecutar varias réplicas debe sustituirse por un contador compartido.

## Pruebas y build

Ejecuta la suite:

```powershell
./mvnw.cmd test
```

Genera el artefacto:

```powershell
./mvnw.cmd package
```

Las pruebas cubren servicios, contratos HTTP, seguridad, DTOs e integraciones. Al añadir funcionalidad, incluye caminos felices, validación, errores, autorización y aislamiento entre propietarios.

## Imagen Docker

La imagen usa una compilación multi-stage con Eclipse Temurin 21:

```powershell
docker build -t yomio-api .
```

El contenedor escucha en el puerto `8080` y necesita recibir las variables de base de datos, JWT y CORS. En el entorno completo, `docker-compose.yml` las configura y espera a que PostgreSQL esté saludable.

## Criterios para cambios

- Conserva el flujo `controller → service → repository`.
- Usa DTOs y Bean Validation en los límites.
- No aceptes el tenant o propietario desde el cliente.
- Evita consultas privadas por ID sin filtro de usuario y evita N+1.
- Mantén `open-in-view=false`.
- Aísla integraciones externas y no expongas sus respuestas como contrato interno.
- Documenta cambios incompatibles, configuración nueva y migraciones.

Consulta también el [README principal](../../README.md).
