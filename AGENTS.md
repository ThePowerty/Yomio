# AGENTS.md
## Producto
- Yomio es una aplicación web para registrar anime, películas, manga y manhwa; el objetivo comercial es centralizar seguimiento, catálogo y recomendaciones para mejorar retención y uso recurrente.
## Stack comprobado
- Backend: Java 21, Spring Boot 4.1.0, Maven Wrapper, Spring MVC, Security, Validation, Data JPA, Lombok y PostgreSQL JDBC.
- Frontend/infra: React 19.2.1, React Router 7.17.0, Vite 7.2.7, Node 22, PostgreSQL 16, Nginx 1.27 y Docker Compose.
## Arquitectura y seguridad
- Conserva la arquitectura por capas: controllers → services → repositories, con DTOs en los límites, entidades JPA solo en persistencia e integraciones externas aisladas.
- La API es stateless: JWT Bearer, BCrypt, validación de entrada, CORS explícito y mínimo privilegio; nunca expongas credenciales ni detalles internos.
- El multi-tenancy es por propietario: deriva el usuario del contexto autenticado y filtra toda lectura/escritura privada por `user`; nunca aceptes el tenant desde el cliente.
## Estructura real
- `src/main/java/com/code/DayTracker`: aplicación y paquetes `controllers`, `services`, `repositories`, `models` y `dto`.
- `security`, `config` y `exceptions`: autenticación/autorización, beans/políticas HTTP y traducción coherente de errores.
- `integrations/anilist`, `integrations/kitsu` e `integrations/mangadex`: fuentes públicas aisladas; `src/main/resources`: configuración y migraciones; `src/test`: pruebas Java.
- `frontend/src`: UI, rutas, estado, API, i18n y estilos; `frontend/dist` es salida generada; Dockerfiles y Compose definen API, UI y base de datos.
## Convenciones de código, API y datos
- Usa nombres claros, inyección por constructor, funciones pequeñas, DTOs inmutables cuando proceda y el estilo existente; evita abstracciones prematuras.
- Mantén rutas bajo `/api`, JSON consistente, Bean Validation, códigos HTTP semánticos y errores centralizados; no rompas contratos sin documentarlo.
- Modela ownership y restricciones en JPA/PostgreSQL; evita N+1, `open-in-view` y consultas sin filtro de usuario para recursos privados.
- Hoy Hibernate usa `ddl-auto=update` y no hay migrador versionado: todo cambio de esquema debe incluir una migración reproducible antes de producción.
## Flujo de trabajo
- Analiza primero `MEMORY.md`, requisitos, código afectado, contratos, seguridad y estado del árbol; delimita alcance, supuestos y riesgos.
- Implementa el cambio mínimo coherente, preserva compatibilidad y separa refactors no esenciales.
- Prueba los caminos felices, errores, autorización y aislamiento; documenta comportamiento, configuración, riesgos y migraciones.
## Testing y CI/CD
- Backend: ejecuta `./mvnw test` (o `mvnw.cmd test` en Windows); frontend: `npm run build`; no existe suite frontend declarada actualmente.
- No se observan workflows CI/CD en el repositorio: no inventes controles y propón automatizar build, tests e imágenes cuando corresponda.
- Nunca declares pruebas, builds, despliegues o migraciones que no hayas ejecutado; informa comandos, resultado y cualquier omisión.
## Entregas
- Usa Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`); cada PR debe explicar contexto, alcance, pruebas, riesgos, compatibilidad y migraciones.
## Límites
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- Prohibido introducir secretos o datos sensibles, registrar tokens/PII, añadir dependencias injustificadas o hacer cambios destructivos sin aprobación explícita.
## Memoria

- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).
