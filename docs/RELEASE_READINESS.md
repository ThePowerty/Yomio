# Release readiness — 2026-11-18

## Resultado ejecutivo

No publicar todavía. Los controles de aplicación críticos están reforzados y la restauración se verificó, pero quedan bloqueos operativos: configurar entrega SMTP real, completar el escaneo Java con NVD y diseñar RLS con contexto de tenant por transacción. Analytics, captura externa de errores y la auditoría visual completa requieren además proveedor/consentimiento o un navegador estable.

## Controles verificados o implementados

| Área | Estado | Evidencia |
| --- | --- | --- |
| Secretos frontend | Correcto | Barrido sin API keys; el token JWT se guarda en `localStorage`, riesgo residual mitigado con CSP y ausencia de sumideros XSS conocidos. |
| Registro/Auth | Corregido | El cliente ya no envía rol; el servidor siempre registra `USER`; login mantiene error genérico y JWT exige secreto de 32 bytes. |
| Autorización por propietario | Cubierto a nivel aplicación | Repositorios privados filtran por `user.username`; prueba automática niega leer un seguimiento ajeno. |
| SQL injection | Sin hallazgos | JPA y parámetros nombrados; no hay SQL dinámico, `JdbcTemplate`, `EntityManager` nativo ni concatenación de consultas. |
| XSS | Sin hallazgos directos | React escapa texto; no hay `dangerouslySetInnerHTML`, `innerHTML`, `eval` ni `javascript:`. Nginx sirve CSP y cabeceras defensivas. |
| Abuso API | Implementado | Ventana de 10 peticiones/minuto para Auth y 120/minuto para API, por usuario autenticado o IP directa, con `429` y `Retry-After`. Para varias réplicas debe migrarse a Redis/gateway. |
| Errores y logs | Implementado | Respuestas estructuradas, `X-Request-Id`, 401/403/429 coherentes y errores 500 sin detalles internos. Se desactiva el logger de excepciones resueltas de Spring porque incluía valores rechazados; no se registran tokens, cuerpos, contraseñas ni emails. |
| Dependencias frontend | Correcto en producción | `npm audit --omit=dev`: 0 vulnerabilidades; quedan avisos altos solo en toolchain de desarrollo de Vite y no se forzó un downgrade incompatible. |
| Dependencias Java | Auditoría incompleta | Compilación y tests correctos. OWASP Dependency-Check se detuvo al 5 % de 427.613 registros porque NVD sin API key no finaliza en tiempo razonable. Ejecutarlo en CI con `NVD_API_KEY`. |
| Recuperación de contraseña | Implementado, entrega pendiente | Token aleatorio, hash SHA-256 en BD, 15 min, un uso, respuesta anti-enumeración y pruebas. El cambio invalida JWT anteriores mediante versión HMAC de credencial. SMTP está desactivado hasta configurar proveedor. |
| Monitorización | Base implementada | Actuator expone health sin detalles y métricas Prometheus solo a ADMIN; Error Boundary evita pantalla en blanco. Falta conectar alertas/collector externo. |
| Conversión de onboarding | Instrumentada | Eventos sin PII para inicio, alta, fin de onboarding, login, primer título/progreso y cierre inesperado. `dataLayer` solo se activa con `VITE_ANALYTICS_ENABLED=true`; falta consentimiento/proveedor. |
| Pagos/webhooks | No aplica | No existen módulos, endpoints, SDK ni configuración de pagos/webhooks en el repositorio. |
| Backups | Verificado | `ops/backup-postgres.ps1` creó el dump y se restauró en `tracker_restore_test`; la consulta de control devolvió 1 usuario. El dump permanece ignorado por Git. |

## Base de datos y RLS

`ops/postgres/permissions.sql` separa el rol de migración (`yomio_migrator`) del rol de aplicación (`yomio_app`) y elimina privilegios públicos. Debe ejecutarse con credenciales administradas por el entorno.

RLS queda como bloqueo consciente: con un único rol de conexión pooled, PostgreSQL no conoce al usuario autenticado. La implementación segura requiere propagar `user_id` con `SET LOCAL` dentro de cada transacción, políticas sobre todas las tablas privadas, un rol que no sea propietario ni tenga `BYPASSRLS`, y pruebas de aislamiento contra PostgreSQL real. No activar políticas parciales.

## Comprobaciones antes de publicar

1. Configurar `POSTGRES_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS` y SMTP en el gestor de secretos; rotar cualquier valor usado previamente fuera de local.
2. Crear roles de migración/aplicación, ejecutar Flyway con el primero y la API con el segundo. Completar una migración base reproducible: las migraciones actuales son incrementales y una BD vacía todavía depende de Hibernate. Solo entonces cambiar `HIBERNATE_DDL_AUTO` de `update` a `validate` en producción.
3. Ejecutar suite backend, build frontend y smoke tests HTTP contra PostgreSQL limpio.
4. Repetir backup/restauración en el entorno de preproducción y validar conteos y una autenticación de prueba; la restauración local ya fue correcta.
5. Ejecutar auditoría de navegador a 320, 375, 768, 1024 y 1440 px, teclado completo, zoom 200 %, contraste y lector de pantalla. Aún no hay Playwright/axe automatizado.
6. Elegir proveedor de analytics y errores, definir consentimiento/retención y cargar DSN o claves solo desde entorno. Eventos mínimos sugeridos: `onboarding_started`, `account_created`, `first_title_added`, `first_progress_updated`, `onboarding_completed`.

## Comandos de validación

```powershell
.\mvnw.cmd test
.\mvnw.cmd org.owasp:dependency-check-maven:12.1.9:check -DnvdApiKey=$env:NVD_API_KEY
Set-Location frontend
npm run build
npm audit --omit=dev
```
