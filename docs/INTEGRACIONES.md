# Integraciones

## 1. Solicitudes (formularios)

**Flujo:** formulario por pasos → `POST /api/solicitudes` → validación en servidor → almacenamiento → CRM → respuesta.

| Control | Implementación |
|---|---|
| Validación | Mismas reglas en navegador (mensajes inmediatos) y servidor (zod). Teléfonos colombianos normalizados a `+57XXXXXXXXXX`. |
| Antispam | Campo trampa invisible + tiempo mínimo de 3 s desde que se abre el formulario. Se rechaza sin registrar y sin mostrar éxito. |
| CSRF | Solo se aceptan peticiones cuyo `Origin` es el propio sitio. |
| Límite de envíos | 5 por IP cada 10 min. En memoria; con `UPSTASH_REDIS_REST_URL/TOKEN` el límite es global (recomendado en Vercel). |
| Duplicados | Cada formulario genera una clave de idempotencia; reintentos o doble clic devuelven la misma referencia. |
| Consentimiento | Casilla obligatoria (no premarcada) + casilla comercial opcional separada. Se guarda versión, hash SHA-256 del texto aceptado y fecha. Si el texto cambió, la API pide recargar (409). |
| Fallos | Sin almacenamiento → 503; error de escritura → 500. El formulario conserva los datos y ofrece WhatsApp si está configurado. |
| Registros del servidor | Solo referencia y estado; nunca nombre, teléfono ni correo. |

**Campos registrados** (`SolicitudRegistro` en `src/lib/leads/schema.ts`): referencia `LX-AAAAMMDD-XXXXXX`, tipo (contacto/agendamiento), público, área, subcategoría, ciudad, preferencia de contacto, nombre, teléfono, correo, empresa (opcional), cómo nos conoció (opcional), preferencias de agendamiento, consentimiento, atribución (UTM, gclid/fbclid, landing, referencia), canal derivado, página de origen, estado `solicitud_recibida`, `requiereRevisionHumana` (área «otro»), responsable, estado de sincronización con el CRM.

No se solicitan documentos, números de identificación, NIT ni detalles del caso.

## 2. Almacenamiento

- `LEAD_STORE=file`: `data/solicitudes.jsonl` (permisos 600) y `data/eventos-crm.jsonl`. Válido en desarrollo o en un servidor con disco persistente y copias de seguridad.
- `LEAD_STORE=supabase`: ejecutar `supabase/migrations/001_solicitudes.sql` y registrar el hash del secreto (instrucciones en el archivo). Diseño de acceso mínimo:
  - La tabla vive en el esquema privado `lexpertise`, que la API de Supabase no expone (con la clave pública no se puede leer ni listar).
  - El sitio escribe solo mediante `lx_registrar_solicitud` y `lx_actualizar_crm`, que exigen `SUPABASE_RPC_SECRET`; la base guarda únicamente su hash SHA-256.
  - Basta la clave publicable (`SUPABASE_KEY`); no hace falta la `service_role`.
  - Las duplicadas se resuelven en la base (restricción única de `idempotency_key`): un reintento devuelve la referencia original.
  - El asesor de seguridad de Supabase marca dos avisos esperados: tablas con RLS sin políticas (intencional) y funciones `SECURITY DEFINER` ejecutables por `anon` (protegidas por el secreto).
- **Staging actual:** proyecto «Segmenta web» (esquema `lexpertise`), por el límite de proyectos gratuitos de la organización. Para producción, crear un proyecto dedicado de LEXPERTISE.

## 3. CRM

**Estado:** interfaz construida, **sin conexión**. El CRM conectado a esta cuenta de trabajo (pipeline «Ventas», 3 etapas, valores en USD) no se identificó como de LEXPERTISE, por lo que no se escribió en él.

**Conexión:** `CRM_WEBHOOK_URL` + `CRM_WEBHOOK_SECRET`. Cada solicitud se envía como:

```json
{
  "evento": "solicitud.creada",
  "version": 1,
  "solicitud": { "...registro completo..." },
  "oportunidad": { "pipeline": "Solicitudes web", "etapa": "Solicitud recibida", "titulo": "Solicitud · familia · persona", "requiereRevisionHumana": false }
}
```

Cabeceras: `X-Lexpertise-Timestamp`, `X-Lexpertise-Signature: sha256=<HMAC(secreto, timestamp + "." + cuerpo)>`, `Idempotency-Key`.
El receptor (webhook del CRM o un orquestador como Make, Zapier o n8n) debe verificar la firma, rechazar marcas de tiempo de más de 5 minutos y deduplicar por `Idempotency-Key`.

**Pipeline sugerido** (adaptar al real): Solicitud recibida → Pendiente de contacto → Contactado → En evaluación → Consulta por programar → Consulta programada → Consulta realizada → Propuesta de servicios → Contratado → No contratado / cerrado.

**Campos a crear en el CRM:** público, área general, subcategoría, ciudad, canal de origen, landing, utm_source/medium/campaign/content/term, preferencia de contacto, agendamiento (fechas/franja/modalidad), referencia LX, versión de consentimiento, consentimiento comercial (sí/no), responsable asignado, requiere revisión humana.

**Reglas:** no rechazar automáticamente por condición económica, características personales u otra información sensible. Las solicitudes «otro» van a revisión humana con respuesta informativa.

**Pendiente de LEXPERTISE:** CRM real, API o webhook, autenticación, etapas, asignación, manejo de duplicados y permisos.

## 4. WhatsApp

- Número oficial en `content/settings/whatsapp.json` (formato internacional sin signos, p. ej. `573001234567`).
- Mensajes por contexto (general, divorcios, empresas, familia, laboral, contratos, agendar), editables desde el panel.
- Cada página de servicio define su contexto (`whatsapp:` en el frontmatter). La barra móvil cambia el mensaje según la ruta.
- Sin número: en revisión se muestra un botón deshabilitado «Pendiente»; en producción no se muestra.

## 5. Medición y publicidad

Las etiquetas **no se cargan** hasta que la persona acepta la categoría correspondiente en el banner (Modo de consentimiento v2 con todo denegado por defecto).

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager (si se usa, configurar GA4 dentro de GTM y dejar `NEXT_PUBLIC_GA4_ID` vacío). |
| `NEXT_PUBLIC_GA4_ID` | GA4 directo, sin GTM. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Píxel de Meta (solo con consentimiento de publicidad). |
| `META_PIXEL_ID`, `META_CAPI_TOKEN` | API de Conversiones (servidor), opcional. |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Etiqueta de verificación de Search Console. |

**Eventos** (`src/lib/analytics.ts`):

| Evento | Cuándo | GA4 / dataLayer | Meta |
|---|---|---|---|
| `page_view` | Navegación | automático (medición mejorada) | `PageView` |
| `view_service` | Abrir una página de servicio | `area`, `servicio` | `ViewContent` |
| `click_whatsapp` | Clic en WhatsApp | `contexto`, `ubicacion` | `Contact` |
| `click_call` | Clic en llamar | `ubicacion` | `Contact` |
| `form_start` | Primera interacción con un formulario | `formulario` | — |
| `generate_lead` | **Después** de que el servidor confirma el registro | `formulario`, `area`, `publico` + `event_id` | `Lead` + `eventID` |
| `schedule_request` | Solicitud de consulta confirmada por el servidor | ídem | `Schedule` + `eventID` |
| `appointment_confirmed` | Calendly confirma una reserva (si se activa) | `formulario` | `Schedule` |

- **Deduplicación:** el `event_id` del navegador y el de la API de Conversiones es la referencia de la solicitud (`LX-…`).
- **Datos que nunca se envían:** nombre, teléfono, correo, ciudad, subcategoría ni detalles del caso. A Meta no se envía siquiera el área jurídica.
- **Nota para revisión:** la URL de la página (p. ej. `/divorcio-unilateral`) llega a las plataformas con el `PageView` cuando hay consentimiento. Validar con la firma.
- **Conversiones en Google Ads/Meta:** marcar `generate_lead`/`Lead` y `schedule_request`/`Schedule` como conversiones; no usar visitas a `/gracias`.
- **Pruebas A/B:** los textos viven en contenido (JSON/Markdown), por lo que pueden crearse variantes de landing (p. ej. `divorcio-unilateral-b`) con su propio `seo` y medir por `paginaOrigen`. Para pruebas aleatorias, integrar Vercel Edge Config o la herramienta que se apruebe.

## 6. Atribución

`src/lib/attribution.ts`: primer y último contacto (UTM, gclid, fbclid, landing sin parámetros, dominio de referencia). Se mantiene en memoria durante la visita y solo se guarda en el navegador (`lx_attr`, 90 días) con el consentimiento «Funcionales». Se adjunta únicamente a la solicitud que la persona envía.

## 7. Agendamiento

- **Estado actual:** solicitud de consulta pendiente de confirmación (modalidad preferida, hasta 3 fechas entre mañana y 90 días, franja). Sin horarios ficticios, sin cobro, sin precio publicado.
- **Calendly (opcional):** `sitio.json → agendamiento.proveedor = "calendly"` y `calendlyUrl`. Se carga bajo demanda y registra `appointment_confirmed` solo con el evento de reserva de Calendly.
- **Google Calendar:** recomendado a través del CRM o de Calendly. No se conectó porque no hay calendario confirmado de la firma.

## 8. Panel de contenidos

Decap CMS en `/admin` con flujo editorial (borrador → en revisión → listo).
Producción: crear una GitHub OAuth App con callback `https://<dominio>/api/cms/callback`, definir `GITHUB_OAUTH_CLIENT_ID/SECRET` y completar `repo`, `base_url` y `site_url` en `public/admin/config.yml`. Solo pueden guardar las cuentas con permiso de escritura en el repositorio.
