# Frontend de Yomio

SPA de Yomio construida con React 19, React Router 7 y Vite 7. Consume la API REST, mantiene la sesión JWT en el navegador y ofrece las vistas públicas, privadas y de administración del producto.

## Requisitos

- Node.js 22.
- npm, usando el `package-lock.json` versionado.
- Backend disponible en `http://localhost:8080` durante el desarrollo local.

## Desarrollo

Desde `frontend`:

```powershell
npm install
npm run dev
```

La aplicación queda disponible en [http://localhost:5173](http://localhost:5173). Vite redirige las peticiones `/api` a `http://localhost:8080` cuando `VITE_API_URL` está vacío; también puedes definir una URL explícita en `frontend/.env`.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor Vite con recarga en caliente en el puerto `5173` |
| `npm run build` | Build de producción en `dist` |
| `npm run preview` | Previsualiza localmente el build generado |

Actualmente no hay scripts de test, lint o formateo declarados en `package.json`. No los des por ejecutados ni por disponibles hasta incorporarlos al proyecto.

## Variables de entorno

Copia el ejemplo sin confirmar el resultado en Git:

```powershell
Copy-Item .env.example .env
```

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | Origen de la API; vacío usa el mismo origen y el proxy de desarrollo |
| `VITE_PUBLIC_SITE_URL` | URL canónica pública y metadatos sociales |
| `VITE_LEGAL_ENTITY_NAME` | Titular legal mostrado en las páginas legales |
| `VITE_PRIVACY_EMAIL` | Contacto de privacidad |
| `VITE_LEGAL_ADDRESS` | Dirección legal verificada |
| `VITE_ANALYTICS_ENABLED` | Habilita la integración opcional de analítica |
| `VITE_GA_MEASUREMENT_ID` | Identificador de GA4, si se habilita y existe consentimiento |
| `VITE_LOCAL_BUSINESS_NAME`, `VITE_PUBLIC_ADDRESS`, `VITE_PUBLIC_LOCALITY`, `VITE_PUBLIC_COUNTRY` | Datos públicos opcionales y verificados |
| `VITE_MAPS_DIRECTIONS_URL` | Enlace opcional a indicaciones |

Las variables `VITE_*` quedan incluidas en el bundle durante el build: nunca guardes secretos en ellas. No rellenes identidad legal, ubicación, reseñas o datos de negocio con contenido ficticio.

## Rutas

Públicas:

- `/`: landing para visitantes e inicio personal para usuarios autenticados.
- `/auth`: registro, login y recuperación de acceso.
- `/privacy` y `/legal`: información legal.
- Cualquier ruta desconocida muestra la página 404 de marca.

Privadas:

- `/tracking`, `/wishlist` y `/calendar`.
- `/catalog/anime`, `/catalog/manga`, `/catalog/manhwa` y `/catalog/movie`.
- `/catalog/:type/:id`.
- `/stories/:mediaId` y `/ratings/:mediaId`.
- `/recommendations`.
- `/admin`, disponible solo para el rol `ADMIN`.

La protección del router mejora la experiencia, pero la autorización efectiva siempre corresponde al backend.

## Estructura

```text
src/
├── components/       # Componentes reutilizables y estilos asociados
├── context/          # Sesión y estado de seguimiento
├── content/          # Contenido de marketing
├── layouts/          # Estructura de páginas autenticadas
├── lib/i18n/         # Configuración y recursos de traducción
├── pages/            # Pantallas agrupadas por funcionalidad
├── routes/           # Declaración y protección de rutas
├── services/         # Cliente HTTP y analítica
├── App.jsx
├── main.jsx
└── styles.css
```

Los estilos específicos viven junto a su componente o página. `DESIGN.md` y `UX-CONTRACT.md`, en la raíz, recogen decisiones compartidas de diseño e interacción.

## Sesión y API

El cliente HTTP está centralizado en `src/services/api.js`, añade el header `Authorization: Bearer ...`, impone un timeout y muestra la referencia `X-Request-Id` cuando el backend la devuelve.

La sesión actual se conserva en `localStorage`, sincroniza el cierre entre pestañas y avisa cinco minutos antes de la expiración. Esto mantiene compatibilidad con el contrato vigente, pero implica riesgo residual ante XSS; conserva la CSP, evita HTML sin escapar y no registres tokens ni datos personales.

## Internacionalización, SEO y analítica

- i18next centraliza los textos traducibles en `src/lib/i18n`.
- `SeoManager` gestiona título, descripción, canonical, Open Graph, Twitter, robots y schema por ruta.
- GA4 solo debe cargarse cuando el flag, el identificador y el consentimiento explícito estén presentes.
- Los eventos de conversión no deben contener PII.

## Build y despliegue

Valida el build:

```powershell
npm run build
```

La imagen Docker compila la SPA con Node 22 y sirve `dist` desde Nginx 1.27. `nginx.conf` incluye fallback para React Router, proxy de `/api/` al servicio `api` y cabeceras CSP, Referrer-Policy, nosniff, frame y permisos.

```powershell
docker build -t yomio-frontend .
```

Al desplegar fuera de Compose, conserva el fallback de SPA y configura el proxy o `VITE_API_URL` de forma coherente con CORS.

### GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` compila y publica el frontend cuando hay un push a `master`, y también admite ejecución manual. Calcula automáticamente el prefijo del repositorio (`/Yomio/` en este proyecto), configura React Router para esa subruta y publica un `404.html` de respaldo para las rutas de la SPA.

Antes del primer despliegue:

1. En **Settings → Pages**, selecciona **GitHub Actions** como origen.
2. Crea la variable de repositorio `VITE_API_URL` con el origen HTTPS público del backend, sin `/api` al final.
3. Añade la URL de Pages a `CORS_ALLOWED_ORIGINS` en el backend.

GitHub Pages solo aloja el frontend estático; la API Spring Boot y PostgreSQL deben desplegarse por separado. Las variables `VITE_*` son públicas y no deben contener secretos.

## Criterios para cambios

- Reutiliza el cliente API y los contextos existentes.
- Mantén estados de carga, vacío, error, éxito y permisos.
- Comprueba teclado, foco, contraste, movimiento reducido y diseño responsive.
- No uses el estado del frontend como barrera de seguridad.
- Actualiza traducciones, metadatos y documentación al añadir rutas visibles.
- Ejecuta `npm run build` antes de entregar cambios.

Consulta también el [README principal](../README.md) y la [guía del backend](../docs/backend/README.md).
