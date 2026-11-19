# Yomio

Yomio es una aplicación web para llevar el seguimiento de anime, películas, manga y manhwa desde un único lugar. Permite consultar un catálogo, registrar progreso, organizar pendientes, valorar capítulos, guardar notas privadas y descubrir recomendaciones basadas en las preferencias del usuario.

## Estado del proyecto

El repositorio contiene una SPA en React y una API REST en Spring Boot, preparadas para ejecutarse juntas con Docker Compose. El producto sigue en fase previa a publicación y requiere completar la configuración operativa descrita en esta guía antes de desplegarlo en producción.

## Funcionalidades

- Registro, inicio de sesión y renovación de sesión mediante JWT Bearer.
- Seguimiento de progreso y lista de pendientes.
- Catálogos de anime, películas, manga y manhwa.
- Calendario de próximas publicaciones con fecha confirmada.
- Notas privadas, valoraciones por capítulo y tendencias agregadas.
- Comunidad con control de spoilers según el progreso del usuario.
- Recomendaciones configurables basadas en reglas.
- Administración de la actualización del catálogo.
- Recuperación de contraseña y eliminación de cuenta.
- Interfaz en español e inglés, páginas legales y consentimiento de analítica.

## Stack

| Área | Tecnología |
| --- | --- |
| API | Java 21, Spring Boot 4.1, Spring MVC, Spring Security, Spring Data JPA |
| Datos | PostgreSQL 16, Hibernate, Flyway |
| Web | React 19, React Router 7, Vite 7, GSAP, i18next |
| Infraestructura | Docker Compose, Nginx 1.27 |
| Observabilidad | Spring Boot Actuator, Micrometer, Prometheus |

## Inicio rápido con Docker

Requisitos:

- Docker con Docker Compose.
- Puertos `5173` y `55432` libres.

1. Crea la configuración local:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Sustituye en `.env` `POSTGRES_PASSWORD` y `JWT_SECRET` por valores aleatorios. El secreto JWT debe tener al menos 32 bytes. Para desarrollo local, ajusta también:

   ```dotenv
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   PASSWORD_RESET_BASE_URL=http://localhost:5173/reset-password
   ```

3. Construye y arranca los servicios:

   ```powershell
   docker compose up --build
   ```

4. Abre [http://localhost:5173](http://localhost:5173). La API queda accesible a través del proxy de Nginx y PostgreSQL se publica en `localhost:55432`.

Para detener los contenedores sin borrar los datos:

```powershell
docker compose down
```

El volumen `postgres-data` conserva la base de datos. No uses `docker compose down -v` salvo que quieras eliminarla deliberadamente.

## Desarrollo local

Puedes ejecutar únicamente PostgreSQL en Docker y levantar las dos aplicaciones con recarga en caliente:

```powershell
docker compose up -d postgres
```

Configura en el `.env` raíz las credenciales que usará Spring Boot:

```dotenv
DB_URL=jdbc:postgresql://localhost:55432/tracker
DB_USERNAME=yomio
DB_PASSWORD=el-mismo-valor-de-POSTGRES_PASSWORD
JWT_SECRET=un-secreto-aleatorio-de-al-menos-32-bytes
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Arranca el backend desde la raíz:

```powershell
./mvnw.cmd spring-boot:run
```

En otra terminal, arranca el frontend:

```powershell
Set-Location frontend
npm install
npm run dev
```

En este modo la web se sirve en `http://localhost:5173` y la API en `http://localhost:8080`. Encontrarás instrucciones más detalladas en las guías de cada parte.

## Verificación

Backend:

```powershell
./mvnw.cmd test
```

Frontend (actualmente no hay una suite automatizada declarada):

```powershell
Set-Location frontend
npm run build
```

## Estructura

```text
.
├── src/                         # API Spring Boot y pruebas Java
├── frontend/                    # SPA React y configuración Nginx
├── docs/                        # Documentación técnica y de publicación
├── ops/                         # Backup, restauración y permisos PostgreSQL
├── docker-compose.yml           # PostgreSQL, API y frontend
├── Dockerfile                   # Imagen de la API
└── pom.xml                      # Dependencias y build Maven
```

## Documentación

- [Backend](docs/backend/README.md): arquitectura, API, configuración, seguridad y migraciones.
- [Frontend](frontend/README.md): rutas, estructura, variables y comandos.
- [Contrato de experiencia](UX-CONTRACT.md) y [dirección visual](DESIGN.md).

## Seguridad y producción

- Los recursos privados siempre se filtran por el usuario autenticado; el cliente nunca elige el propietario.
- El registro público crea únicamente usuarios con rol `USER`; las actualizaciones de catálogo requieren `ADMIN`.
- No confirmes secretos ni archivos `.env` en Git.
- CORS debe limitarse a los orígenes reales del despliegue.
- El rate limit actual vive en memoria y no sustituye una solución compartida cuando haya varias réplicas.
- Las migraciones existentes no forman todavía una línea base completa para una base vacía con `ddl-auto=validate`; revisa la guía de preparación antes de producción.

## Flujo de contribución

Mantén los cambios pequeños, acompaña cualquier modificación de esquema con una migración reproducible y valida autorización y aislamiento entre usuarios. Los mensajes de commit siguen [Conventional Commits](https://www.conventionalcommits.org/), por ejemplo `feat: add release reminders` o `fix: scope notes by owner`.
