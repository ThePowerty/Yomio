# MEMORY.md

## Estado actual
- Yomio es una SPA React 19 sobre Spring Boot 4.1/PostgreSQL 16 para anime, películas, manga y manhwa.
- Inicio incluye calendario compacto de próximas publicaciones; `/calendar` ofrece mes y agenda con fechas confirmadas de obras activas.
- DM Sans, identidad oficial, seguimiento, pendientes, catálogo, notas privadas, valoraciones, comunidad y recomendaciones rule-based están integrados.
- `/api/tracks` excluye `PLAN_TO_READ`; `/api/wishlist` controla pendientes y la transición a seguimiento.
- El backend calcula límites de spoilers desde el progreso autenticado; notas y valoraciones privadas filtran siempre por propietario.
- Registro público siempre crea `USER`; refrescos de catálogo requieren `ADMIN`; JWT stateless dura 2 h por defecto, avisa 5 min antes y exige secreto de 32 bytes.
- Auth y API tienen límites por minuto, errores JSON, `X-Request-Id`, CORS configurable, CSP y logs sin cuerpos/tokens.
- Recuperación de contraseña usa token aleatorio, hash SHA-256, 15 minutos y un uso; invalida JWT previos y SMTP espera proveedor.
- Actuator expone health sin detalles y Prometheus solo a ADMIN; el frontend tiene Error Boundary y eventos de conversión sin PII.
- `docs/RELEASE_READINESS.md` contiene la matriz de auditoría, bloqueos y pasos de publicación.
- `/privacy` y `/legal` son públicas; `docs/STORE_PUBLISHING.md` documenta requisitos Google/Apple y permisos.
- Registro exige aceptar políticas y guarda fecha/versión; Ajustes permite borrado irreversible con doble confirmación y usuario escrito.
- El icono oficial de Yomio está declarado como favicon ICO/PNG y `apple-touch-icon`.
- Arranque local carga `.env`; credenciales sincronizadas con el volumen antiguo (`postgre`), V10 aplicada y health `UP` el 2026-11-19.
- GSAP anima continuamente el login con libro→páginas→Y y una ruta ambiental de seguimiento; en movimiento reducido ambos bucles usan solo fundidos/pulsos de opacidad.
- `/` muestra una landing pública al usuario anónimo y conserva el inicio personal al autenticado; incluye CTA inicial/móvil, enlaces internos, respuestas rápidas, 5 FAQs, casos ilustrativos y agradecimientos.
- Rutas desconocidas muestran una 404 de marca; títulos, descripciones, canonical, Open Graph/Twitter, robots y schema de aplicación/FAQ se gestionan por ruta.

## Decisiones vigentes
- Obtener siempre el propietario del contexto autenticado; nunca aceptar `user_id` ni rol desde el cliente.
- Mantener JWT en Bearer por compatibilidad; `localStorage` conserva riesgo residual mitigado por CSP y ausencia de HTML sin escapar.
- No activar RLS hasta propagar un tenant con `SET LOCAL` dentro de cada transacción y usar un rol no propietario/sin `BYPASSRLS`.
- Separar rol migrador y rol de aplicación con mínimo privilegio; `ops/postgres/permissions.sql` documenta los grants.
- Versionar cambios con Flyway; V10 añade consentimiento y cascada de borrado. Falta una migración base completa antes de usar `ddl-auto=validate` en una BD vacía.
- No presentar recomendaciones como IA ni estimar capítulos/fechas de obras abiertas.
- Mantener separadas comunidad pública, notas privadas, valoraciones y recomendaciones.
- GA4 solo carga con flag, ID y consentimiento explícito; anuncios permanecen denegados y los eventos permitidos no contienen PII.
- No inventar testimonios, dirección ni negocio local: reseñas exigen fuente/permiso y mapa/schema `LocalBusiness` solo aparecen con datos verificados de entorno.

## Bloqueos antes de publicar
- Configurar secretos reales, CORS y SMTP desde el entorno; rotar valores históricos de desarrollo.
- Diseñar/probar RLS real contra PostgreSQL y completar la migración base reproducible.
- Conectar Prometheus/alertas y proveedor de errores; elegir analytics con política de consentimiento/retención.
- Completar la auditoría responsive/accesibilidad del resto de rutas autenticadas; login verificado a 390 px, sin desbordamiento y con teclado.
- Resolver o aceptar formalmente 4 avisos altos solo de toolchain Vite; producción tiene 0 en `npm audit --omit=dev`.
- Completar identidad/contacto legal y plazo de purga de backups; aún no existe proyecto móvil publicable.

## Errores a evitar
- No permitir selección de `ADMIN` en registro ni exponer secretos/defaults inseguros en Compose.
- No consultar/modificar recursos privados por ID sin condición de propietario.
- No registrar tokens, contraseñas, emails, cuerpos de petición o detalles de excepciones en respuestas.
- No habilitar RLS parcial con el rol propietario ni usar rate limit en memoria como solución multi-réplica.
- No forzar `npm audit fix --force`: actualmente propone una bajada incompatible de Vite.
- No desbloquear escritura con `revealFuture`; solo el progreso concede permisos.

## Validación más reciente
- 2026-11-19: landing y 404 verificadas en Chromium de escritorio y 390 px; CTA móvil no duplica el CTA inicial, 5 FAQs funcionan con teclado, metadatos/noindex correctos y consola sin errores.
- 2026-11-19: login GSAP mantiene dos ciclos: marca libro→páginas→Y y fondo con ruta libro/pantalla/recomendación, tarjetas y progreso. En reducido continúan mediante opacidad, sin desplazamientos ni escalas. Verificados ciclos persistentes, consola limpia y composición a 390 px. Carrusel reducido mantiene fundido manual de 180 ms.
- Auditor premium estricto se bloquea sin salida al escanear y se interrumpió; no confundirlo con una auditoría superada.
- `designmd lint DESIGN.md`: 0 errores, 10 avisos heredados de tokens/subtokens.
- `npm audit --omit=dev`: 0; auditoría completa: 4 altas solo dev. Backup restaurado en `tracker_restore_test` con consulta correcta.
- Backend local verificado: Spring inicia en ~5 s y health responde 200; proceso detenido a petición del usuario y puerto 8080 libre.
