# MEMORY.md

## Estado actual
- Yomio ofrece catálogos de anime, películas, manga y manhwa y seguimiento personal desde una SPA React sobre API Spring Boot.
- El alta usa catálogo → detalle → seguimiento con estado, capítulos, progreso, valoración y reseña; las tarjetas muestran esos mismos datos.
- El catálogo indexa títulos localizados y sinónimos; “Estoy siendo criada por villanos” resuelve e importa AniList 167171.
- Todos los avisos de la interfaz usan `Notice`, con una “×” accesible que permite descartarlos sin recargar.
- El catálogo prioriza portadas: revela los datos al hacer hover/foco y calcula la paginación en filas completas según las columnas visibles.
- El seguimiento se registra con estados visuales, selector +/- de capítulos, progreso inmediato y valoración 1-10 al completar.
- La aplicación ocupa `100dvh`: el contenido hace scroll interno; el lateral se contrae a iconos en escritorio y es un panel superpuesto en móvil.
- La cabecera tiene un único control del lateral y un menú de perfil con datos de cuenta, idioma y cierre de sesión confirmado en dos pasos.
- Configuración permite editar usuario/email mediante `/api/account/profile`; el backend valida duplicados y renueva el JWT tras guardar.
- Contraseña por email y MFA aparecen como funciones futuras: no se marcan activas ni almacenan secretos hasta implementar sus flujos seguros.
- Recomendaciones reutiliza tarjetas de catálogo y paginación; Inicio muestra las cuatro primeras en un carrusel automático accesible de dos tarjetas por vista.
- Cada componente React vive en `frontend/src/components/<Componente>/`, con JSX y CSS relacionados colocados juntos.
- El catálogo contiene 454 animes y 100 películas; `MOVIE` es un tipo persistido mediante Flyway V4 y tiene pantalla/seguimiento propios.
- Recomendaciones filtra exclusivamente por Anime, Manga o Manhwa y carga hasta 50 candidatos de cada tipo.

## Decisiones vigentes
- Mantener autenticación JWT stateless y aislamiento por propietario obtenido del contexto autenticado, para impedir acceso cruzado entre usuarios.
- Clasificar como `MANHWA` el contenido manga de AniList cuyo país de origen sea `KR`, porque AniList no expone manhwa como tipo independiente.
- Versionar cambios de esquema con Flyway; V1 añade y rellena `reading_status`, mientras `ddl-auto=update` permanece solo como apoyo del entorno actual.
- V2 actualiza los `CHECK` de `catalog_media.type` y `tracked_items.type` para admitir `MANHWA`; Hibernate no amplía automáticamente restricciones de enums existentes.
- V3 añade `title_localized` y `aliases`; los alias españoles ampliables viven en `catalog-aliases.json` y complementan los `synonyms` de AniList.
- Los manhwas se consultan en AniList con `countryOfOrigin=KR` (10×50 por refresco); MangaDex enriquece búsquedas con títulos alternativos enlazados a AniList.
- AniList está degradado a 30 peticiones/minuto: el cliente aplica 2100 ms entre llamadas, respeta `Retry-After`, reintenta dos veces y conserva refrescos parciales.
- Las consultas populares omiten `search` y `countryOfOrigin` cuando no aplican; AniList devuelve vacío si esos filtros se envían explícitamente como `null`.
- AniList sigue como identidad canónica; Kitsu enriquece coincidencias exactas con datos faltantes. Crunchyroll solo expone documentación para socios, no una API pública general.
- La marca visible y el nombre de Spring son `Yomio`; se conservan artifactId, paquetes y claves internas `DayTracker/daytracker_*` para no romper compatibilidad.
- Al cambiar el nombre de usuario se debe emitir y persistir un JWT nuevo porque el nombre es el `sub` usado por la autenticación.

## Siguiente paso recomendado
- Implementar recuperación de contraseña por email y alta TOTP completa (secreto, QR, verificación y códigos de recuperación) antes de habilitar sus controles.

## Errores a evitar
- No enviar `MANHWA` directamente como tipo GraphQL de AniList: consultar `MANGA` y filtrar/clasificar por país `KR`.
- No asumir que AniList contiene títulos españoles: añadir el alias localizado con su ID AniList verificado cuando falte.
- No raspar lectores sin API estable: usar APIs públicas documentadas y conservar AniList como identidad canónica para evitar duplicados.
- No aumentar llamadas masivas sin ajustar el limitador; anime/manhwa usan 10 páginas y manga 2, siempre con 2100 ms entre llamadas.
- No volver a enviar filtros GraphQL nulos en AniList; construir variables y argumentos solo cuando tengan valor.
- No consumir endpoints internos de Crunchyroll ni hacer scraping; usar solo APIs públicas/documentadas y degradar si una fuente secundaria falla.
- Al ampliar un enum persistido, migrar también cualquier restricción `CHECK` generada previamente en PostgreSQL.
- No confiar en identificadores de usuario del cliente ni copiar secretos de configuración local a entornos reales.
- No mostrar MFA como activo hasta verificar un primer código TOTP en servidor; nunca guardar el secreto en texto plano ni exponerlo después del alta.

## Validación más reciente
- 2026-11-17: reorganización de componentes validada con `npm run build` (Vite 7.3.5, 1782 módulos); última suite Maven: 9 pruebas correctas.
