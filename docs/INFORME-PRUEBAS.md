# Informe de pruebas · 2026-11-13

Entorno: compilación de producción de Next.js 16.4.6 (`next build` + `next start`) en local, Node 24, macOS. Staging = `NEXT_PUBLIC_SITE_ENV=staging`. Variante de producción = misma base con `NEXT_PUBLIC_SITE_ENV=production`, compilada forzando el build (sin el control previo) solo para la prueba.

## Resumen

| Funcionalidad | Estado | Ubicación | Resultado | Acción pendiente |
|---|---|---|---|---|
| Compilación y tipos | Probada | `npm run build`, `npm run typecheck` | Sin errores; 40 rutas | — |
| Navegación y enlaces | Probada | `scripts/test-enlaces.mjs` | Staging: 35 URL, 0 enlaces rotos. Producción: 13 URL, 0 enlaces rotos | — |
| SEO técnico por página | Probada | `scripts/test-enlaces.mjs` | 1 H1, título, descripción y canonical únicos en todas las páginas | — |
| Formularios: API | Probada | `scripts/test-formularios.mjs` | **22/22** (14-nov; ver «Embudo de filtrado»). Base: válido, duplicado, correo/teléfono inválidos, sin consentimiento, área no disponible, campo trampa, envío instantáneo, CSRF, versión de consentimiento, tamaño, JSON malformado, agendamiento válido y con fecha pasada, área «otro», B2B sin NIT, límite por IP (429), método GET | — |
| Formularios: navegador | Probada | `/divorcio-unilateral` | Validación por paso con mensajes específicos y foco en el primer error; envío real registrado; redirección a `/gracias` con referencia | — |
| Persistencia real | Probada (archivo y Supabase) | `data/solicitudes.jsonl`; esquema `lexpertise` en Supabase | Archivo: registro completo. Supabase: **18/18** pruebas de la API con el código de staging; 4 registros válidos sin duplicados, estado CRM actualizado, canal y campaña guardados; datos de prueba eliminados | Proyecto dedicado para producción |
| Seguridad de la base | Probada | funciones `lx_*` | Secreto incorrecto → 401; tabla inaccesible con la clave pública (esquema no expuesto); duplicado devuelve la referencia original | — |
| Staging en Vercel | Desplegado, **público** desde el 14-nov (decisión de la agencia) | `https://lexpertise-colombia.vercel.app` (desde el 17-nov; la anterior redirige con 308) | Hasta el 14-nov estuvo protegido (302 al login; API 401). Ahora: 35 URL con 200 sin sesión, 0 enlaces rotos, `noindex` en meta y cabecera, `robots.txt` con `Disallow: /`; la API rechaza envíos de otros orígenes (403) | Volver a protegerlo si la firma lo pide |
| Sin almacenamiento | Probada | API en variante de producción | 503 y mensaje honesto; sin éxito falso | — |
| CRM | Implementada, **no conectada** | `src/lib/leads/integrations.ts` | El estado queda `no_configurado` | CRM real de la firma |
| WhatsApp dinámico | Implementado, **bloqueado** | `content/settings/whatsapp.json` | Mensaje por página probado en código; sin número oficial se muestra «Pendiente» en revisión y se oculta en producción | Número oficial |
| Agendamiento | Probado (solicitud) | `/agendar-consulta` | Hasta 3 fechas (mañana a 90 días, hora de Colombia), franja y modalidad; sin horarios ficticios | Calendario/Calendly real |
| Consentimiento de cookies | Probado | Banner y pie de página | Sin casillas premarcadas; «Rechazar» con el mismo peso; funcionales guardan `lx_attr` con UTM/fbclid y retirarlas lo borra; se reabre desde el pie | — |
| Medición | Implementada, probada en consola | `src/lib/analytics.ts` | `view_service`, `form_start` y `generate_lead` (con `event_id`) se disparan una vez y solo tras la confirmación del servidor | IDs de GA4/GTM/Meta; prueba en Tag Assistant y Events Manager |
| Ocultamiento en producción | Probado | Variante de producción | Servicios, artículos y equipo sin aprobar → 404 y fuera del menú y del sitemap; sin marcadores «Pendiente»; sin `noindex` | Aprobaciones |
| Bloqueo de build de producción | Probado | `prebuild` | Se detiene con 29 bloqueantes | — |
| Indexación en staging | Probada | robots.txt, meta, cabecera | `Disallow: /`, `noindex` en meta y en `X-Robots-Tag` | — |
| Panel de contenidos | Probado en local | `/admin` + `npm run cms` | Carga la configuración, lista las 6 colecciones y abre las entradas | Login GitHub en producción **sin probar** (requiere OAuth App) |
| Responsive | Probado | 360, 390, 768, 1024 y 1440 px | Sin desbordamiento horizontal en 7 páginas clave; menú de escritorio sin saltos de línea desde 1024 px | — |
| Teclado | Probado | Encabezado y menú móvil | Enlace «Saltar al contenido», foco visible, el menú atrapa el foco, Escape cierra y devuelve el foco | — |
| Seguridad | Probada | Cabeceras, bundle, dependencias | CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS (prod); 0 vulnerabilidades (`npm audit --omit=dev`); ningún secreto en el código del navegador | CSP con nonce (mejora) |

## Lighthouse (móvil, simulación por defecto)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/` (staging) | 100 | 100 | 100 | 66* | 0,9 s | 0 |
| `/divorcio-unilateral` | 100 | 100 | 100 | 66* | 0,9 s | 0 |
| `/divorcio-mutuo-acuerdo` | 100 | 100 | 100 | 66* | 0,9 s | 0 |
| `/divorcio-con-hijos-y-bienes` | 100 | 100 | 100 | 66* | 0,9 s | 0 |
| `/contacto` | 100 | 100 | 100 | 66* | 0,8 s | 0 |
| `/empresas` | 100 | 100 | 100 | 66* | 0,9 s | 0 |
| `/agendar-consulta` | 100 | 100 | 100 | 66* | 0,8 s | 0 |
| `/` (producción) | 100 | 100 | 100 | **100** | 0,9 s | 0 |
| `/contacto` (producción) | 100 | 100 | 100 | **100** | 0,8 s | 0 |

\* En staging el SEO baja solo por `is-crawlable`: el bloqueo de indexación es intencional.

INP no se mide en laboratorio; TBT (su indicador de laboratorio) fue de 0–20 ms. Medir INP real con datos de campo después de publicar.

## Defectos encontrados y corregidos durante QA

1. Los botones del encabezado aparecían en móvil (conflicto `hidden`/`inline-flex`). Corregido.
2. Las etiquetas del menú se partían en dos líneas a 1440 px. Corregido.
3. El panel del menú móvil no se veía: el `backdrop-filter` del encabezado lo contenía. Ahora se renderiza en un portal.
4. LCP de 2,6–2,8 s en las landings: la animación de entrada del hero y el aviso de cookies renderizado en el cliente lo retrasaban. Ahora el aviso se renderiza desde el servidor y la animación solo afecta la tarjeta decorativa. Resultado: 0,9 s.
5. Estructura `<dl>` inválida en los canales de contacto (accesibilidad). Corregido.
6. Faltaba el favicon (error 404 en consola). Agregado.
7. `/admin` devolvía 404. Se agregó una reescritura.
8. La atribución se guardaba sin consentimiento, en contra de la política de cookies. Ahora se guarda solo con «Funcionales».

## Embudo de filtrado y CRO (2026-11-14)

Cambios: preguntas de etapa, urgencia y modalidad; prioridad automática (alta/media/baja) con siguiente paso en `/gracias` (agenda, WhatsApp con resumen o recursos); un solo llamado «Agendar consulta»; WhatsApp y llamada directos retirados; formulario en la primera pantalla del celular en las landings; eventos `form_step` y `open_calendar`; columnas nuevas y vista `resumen_embudo` en Supabase.

| Prueba | Resultado |
|---|---|
| API (archivo local) | **22/22**: las 18 anteriores (actualizadas) + filtro obligatorio, fecha límite → alta, próximos meses → media, solo informarse → baja |
| API contra Supabase (staging) | **22/22**. En la base: etapa, urgencia, modalidad, prioridad, ruta y motivo guardados; la vista `resumen_embudo` agrupa por campaña y prioridad. 7 registros de prueba borrados |
| Enlaces y SEO técnico | 35 URL, 0 enlaces rotos; H1, título, descripción y canonical únicos |
| Recorrido en navegador (375×812) | Landing de divorcio → 3 pasos → `/gracias?ruta=agendar` con el resumen guardado en la sesión |
| Agenda y WhatsApp habilitados (valores de prueba, sin guardar) | Mensaje de WhatsApp con referencia, tema, etapa y urgencia; la agenda de Google se incrusta con `?gv=true` y la política de seguridad la permite; sin errores de consola |
| Primera pantalla | Landing en celular: el formulario empieza en 487 px (antes 1.222 px) con las barras de revisión; Inicio en 1366×650: botones del hero en 623 px (antes 667 px) |

**Lighthouse (móvil, 12.8.2, simulación):** Inicio 97, landing de divorcio unilateral 97, agendar consulta 98; accesibilidad y buenas prácticas 100; CLS 0; TBT 0–10 ms. El LCP simulado da 2,5–2,6 s, **igual que la versión anterior** medida con la misma herramienta (2,4–2,6 s); el LCP observado en la carga real fue de 58–108 ms. El 0,8–0,9 s de la tabla anterior se midió con otra configuración de Lighthouse, así que las cifras no son comparables. Se probó cargar la fuente del título con `display: "optional"`: dos corridas por página dieron el mismo LCP simulado (2,5–2,6 s), así que se revirtió. Según Lighthouse, lo que pesa en la simulación es la descarga de JavaScript (ahorro estimado de unos 300 ms quitando 27 KiB sin usar) y la hoja de estilos que bloquea el render (unos 150 ms); la fuente no influye. También se probó poner los estilos en línea (`experimental.inlineCss`): empeoró el LCP simulado a 2,6–2,8 s y duplicó el HTML (de 146 a 294 KB), así que se revirtió. Con rendimiento 97–98 y carga real de 0,05–0,13 s, la cifra que importa es el LCP de visitantes reales (Search Console) después de publicar.

## Incidencia durante el despliegue (2026-11-14)

El primer despliegue con la CLI quedó en el entorno «production» del proyecto. En el plan Hobby, la protección estándar no cubría el dominio `lexpertise-web.vercel.app`, que respondió **200 sin sesión durante unos 2 minutos**. Esa compilación no tenía variables de entorno: modo de revisión, `noindex`, robots bloqueando todo y formulario sin almacenamiento (503). Se corrigió extendiendo Vercel Authentication a todos los despliegues; desde entonces todas las URL responden 302.

## No probado (requiere accesos)

- Envío al CRM, API de Conversiones de Meta, login de GitHub del panel, Calendly.
- Pruebas automáticas y Lighthouse sobre la URL de staging (protegida); verificación en dispositivos físicos.
