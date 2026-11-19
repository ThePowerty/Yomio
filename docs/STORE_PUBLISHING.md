# Publicación móvil de Yomio

Revisión: 2026-11-18. Volver a comprobar las fuentes oficiales antes de cada envío.

## Estado

Yomio es una SPA web; no existe proyecto Android/iOS, firma ni paquete AAB/IPA. No se puede enviar directamente a las tiendas. Una futura envoltura debe aportar experiencia propia y no limitarse a mostrar la web (Apple 4.2).

La web no usa cámara, micrófono, ubicación, contactos, fotos, Bluetooth ni identificador publicitario. No deben declararse ni solicitarse salvo que una función futura los necesite.

## Datos a declarar

- Identificadores: usuario y correo.
- Contenido: biblioteca, progreso, notas, valoraciones, comentarios, reacciones, reportes y preferencias.
- Diagnóstico/seguridad: identificador de petición, resultado técnico y datos de red mínimos para rate limit y abuso.
- Fuentes externas: AniList, Kitsu y MangaDex; revisar también correo, monitorización y analítica cuando se configuren.

Data safety y App Privacy deben incluir todos los SDK y proveedores del binario final.

## Bloqueos

1. Completar `VITE_LEGAL_ENTITY_NAME`, `VITE_PRIVACY_EMAIL` y `VITE_LEGAL_ADDRESS` y realizar revisión jurídica.
2. Definir y documentar el plazo de purga de backups. El borrado autoservicio ya está disponible en Ajustes y `/privacy#account-deletion` explica públicamente el procedimiento.
3. Crear proyectos móviles, paquete, firma, fichas, capturas, clasificación de edad, datos de revisión y credenciales demo.
4. Android: AAB y API 36 para nuevos envíos/actualizaciones desde 31-08-2026; completar App content, Data safety y testing aplicable.
5. Apple: Xcode 26+ con SDK iOS 26+; `PrivacyInfo.xcprivacy` y razones/firmas requeridas. Capacitor figura entre los SDK sujetos a manifiesto y firma.
6. Validar `/privacy` y `/legal` en producción sin login y mantenerlos coherentes con las fichas.

## Fuentes oficiales

- https://support.google.com/googleplay/android-developer/answer/10144311
- https://support.google.com/googleplay/android-developer/answer/10787469
- https://support.google.com/googleplay/android-developer/answer/13327111
- https://developer.android.com/google/play/requirements/target-sdk
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- https://developer.apple.com/go/?id=ar-ad-support
- https://developer.apple.com/news/upcoming-requirements/
- https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
