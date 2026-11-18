# Integraciones

## 1. Solicitudes (formularios)

**Flujo:** formulario por pasos → `POST /api/solicitudes` → validación en servidor → **prioridad** → almacenamiento → CRM → respuesta con el siguiente paso → `/gracias` (agenda, WhatsApp o recursos).

**Todo pasa por el formulario.** Los botones directos de WhatsApp y llamada se retiraron de las páginas. El único llamado del sitio es «Agendar consulta», que lleva al formulario de la página o a `/agendar-consulta`. WhatsApp aparece después de enviar, con el resumen ya escrito.

### Encuesta de participación (4 pasos como máximo; 3 en landings y páginas de servicio)

| Paso | Campos |
|---|---|
| Tu consulta | Persona o empresa y área (se salta si la página ya los define) |
| Tu situación | Tipo de asunto · **¿En qué punto está?** (aún no inicia / proceso en curso / fecha límite o audiencia próxima / solo informarse) · **¿Cuándo quieres avanzar?** (lo antes posible / este mes / próximos meses / aún no lo sé) |
| La consulta | «La consulta jurídica tiene un costo y dura 90 minutos. Te informamos su valor antes de confirmar la cita.» · **¿Cómo quieres continuar?** (puedo pagar la consulta / me interesa, pero quiero conversar la forma de pago) · modalidad |
| Tus datos para agendar | Ciudad, nombre, celular (WhatsApp), correo, fechas posibles y franja (**solo si no hay agenda en línea**), empresa (opcional), cómo nos conoció (opcional), **aceptación obligatoria de la Política de Cancelación y Reprogramación**, autorizaciones |

**Por decisión de la firma (17-nov-2026), el sitio no publica el valor de la consulta ni remite a una fundación**: el valor se informa por WhatsApp antes de confirmar la cita. La opción «no puedo pagarla» se quitó; quien no puede pagar elige «conversar la forma de pago» y el equipo lo atiende por WhatsApp. La aceptación de la política de cancelación se guarda en cada solicitud (`politicaCancelacion: { aceptada, version, aceptadoEn }`).

### Prioridad y siguiente paso (`src/lib/leads/prioridad.ts`)

| Prioridad | Regla | Siguiente paso en `/gracias` |
|---|---|---|
| Alta | Puede pagar, área atendida, tipo de asunto definido y (fecha límite **o** quiere avanzar lo antes posible o este mes) | Según el pago (columna siguiente) |
| Media | Área «otro», tipo de asunto «otro», quiere conversar el pago, o sin urgencia inmediata | |
| Baja | «Solo quiero informarme» | |

| Respuesta de pago | Ruta | Siguiente paso en `/gracias` |
|---|---|---|
| Puedo pagar | `agendar` | **«Enviar mi solicitud por WhatsApp»**, con el mensaje escrito: valor, referencia, tema, situación, modalidad y pago, más «¿Qué fechas y horas tienen disponibles?». Si hay agenda en línea, también puede apartar la hora. |
| Quiero conversar el pago | `conversar` | WhatsApp con el resumen y «Mi pregunta es:»; si hay agenda, alternativa |

Todas las solicitudes se guardan con `pago`, `prioridad`, `ruta` y `motivoPrioridad`. El resumen para WhatsApp (referencia, tema, etapa y urgencia, sin nombre ni contacto) pasa a `/gracias` por `sessionStorage` (`lx_siguiente_paso`) y se borra al cerrar la pestaña.

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

**Campos registrados** (`SolicitudRegistro` en `src/lib/leads/schema.ts`): referencia `LX-AAAAMMDD-XXXXXX`, tipo (contacto/agendamiento), público, área, subcategoría, **etapa, urgencia, modalidad, prioridad, ruta y motivo de la prioridad**, ciudad, preferencia de contacto, nombre, teléfono, correo, empresa (opcional), cómo nos conoció (opcional), preferencias de agendamiento, consentimiento, atribución (UTM, gclid/fbclid, landing, referencia), canal derivado, página de origen, estado `solicitud_recibida`, `requiereRevisionHumana` (área «otro»), responsable, estado de sincronización con el CRM.

No se solicitan documentos, números de identificación, NIT ni detalles del caso.

## 2. Almacenamiento

- `LEAD_STORE=file`: `data/solicitudes.jsonl` (permisos 600) y `data/eventos-crm.jsonl`. Válido en desarrollo o en un servidor con disco persistente y copias de seguridad.
- `LEAD_STORE=supabase`: ejecutar `supabase/migrations/001_solicitudes.sql` y registrar el hash del secreto (instrucciones en el archivo). Diseño de acceso mínimo:
  - La tabla vive en el esquema privado `lexpertise`, que la API de Supabase no expone (con la clave pública no se puede leer ni listar).
  - El sitio escribe solo mediante `lx_registrar_solicitud` y `lx_actualizar_crm`, que exigen `SUPABASE_RPC_SECRET`; la base guarda únicamente su hash SHA-256.
  - Basta la clave publicable (`SUPABASE_KEY`); no hace falta la `service_role`.
  - Las duplicadas se resuelven en la base (restricción única de `idempotency_key`): un reintento devuelve la referencia original.
  - El asesor de seguridad de Supabase marca dos avisos esperados: tablas con RLS sin políticas (intencional) y funciones `SECURITY DEFINER` ejecutables por `anon` (protegidas por el secreto).
- `supabase/migrations/003_pago_consulta.sql`: columna `pago` («puede» o «conversar»); la vista `resumen_embudo` agrupa también por pago y cuenta `pueden_pagar`.
- `supabase/migrations/002_prioridad_y_reporte.sql`: columnas consultables `etapa`, `urgencia`, `modalidad`, `prioridad` y `ruta`, y la vista **`lexpertise.resumen_embudo`** («qué vende»): solicitudes por semana, canal, campaña, página de entrada, área y prioridad, sin datos personales. Se consulta en el editor SQL de Supabase:
  ```sql
  select * from lexpertise.resumen_embudo order by semana desc, prioridad_alta desc;
  ```
- **Staging actual:** proyecto «Segmenta web» (esquema `lexpertise`, migraciones 001 y 002 aplicadas), por el límite de proyectos gratuitos de la organización. Para producción, crear un proyecto dedicado de LEXPERTISE.

## 3. CRM

**Estado:** interfaz construida, **sin conexión**. El CRM conectado a esta cuenta de trabajo (pipeline «Ventas», 3 etapas, valores en USD) no se identificó como de LEXPERTISE, por lo que no se escribió en él.

**Conexión:** `CRM_WEBHOOK_URL` + `CRM_WEBHOOK_SECRET`. Cada solicitud se envía como:

```json
{
  "evento": "solicitud.creada",
  "version": 2,
  "solicitud": { "...registro completo..." },
  "oportunidad": { "pipeline": "Solicitudes web", "etapa": "Solicitud recibida", "titulo": "[ALTA] Solicitud · familia · persona", "prioridad": "alta", "siguientePaso": "agendar", "motivoPrioridad": "Necesidad definida y quiere avanzar pronto", "requiereRevisionHumana": false }
}
```

Cabeceras: `X-Lexpertise-Timestamp`, `X-Lexpertise-Signature: sha256=<HMAC(secreto, timestamp + "." + cuerpo)>`, `Idempotency-Key`.
El receptor (webhook del CRM o un orquestador como Make, Zapier o n8n) debe verificar la firma, rechazar marcas de tiempo de más de 5 minutos y deduplicar por `Idempotency-Key`.

**Pipeline sugerido** (adaptar al real): Solicitud recibida → Pendiente de contacto → Contactado → En evaluación → Consulta por programar → Consulta programada → Consulta realizada → Propuesta de servicios → Contratado → No contratado / cerrado.

**Campos a crear en el CRM:** **prioridad (alta/media/baja), siguiente paso, etapa, urgencia, modalidad**, público, área general, subcategoría, ciudad, canal de origen, landing, utm_source/medium/campaign/content/term, preferencia de contacto, agendamiento (fechas/franja/modalidad), referencia LX, versión de consentimiento, consentimiento comercial (sí/no), responsable asignado, requiere revisión humana.

**Reglas:** no rechazar automáticamente por condición económica, características personales u otra información sensible. Las solicitudes «otro» van a revisión humana con respuesta informativa.

**Pendiente de LEXPERTISE:** CRM real, API o webhook, autenticación, etapas, asignación, manejo de duplicados y permisos.

## 4. WhatsApp

- Número oficial en `content/settings/whatsapp.json` (formato internacional sin signos, p. ej. `573001234567`).
- **La solicitud de cita se envía por WhatsApp** al terminar la encuesta. Número oficial: **+57 301 6515265** (`573016515265`, línea de atención y WhatsApp corporativo). Mensaje de quien puede pagar: «Hola, quiero agendar una consulta jurídica. Mi solicitud es la LX-…, enviada desde la página web. Tema: … Situación: …; … Modalidad preferida: … Pago: puedo pagar la consulta. Acepté la Política de Cancelación y Reprogramación. ¿Qué fechas y horas tienen disponibles?». Quien quiere conversar el pago recibe el mismo resumen con «Mi pregunta es: ». El mensaje no lleva nombre, teléfono ni correo.
- Es la persona quien envía el mensaje desde su WhatsApp. Para que el aviso llegue solo, sin que la persona lo envíe, haría falta la API de WhatsApp Business o un orquestador conectado al CRM.
- Los mensajes por contexto de `whatsapp.json` quedan para el aviso de error del formulario (si el servidor no responde).
- **Aviso automático a la firma (17-nov-2026):** cada solicitud registrada dispara desde el servidor un mensaje de WhatsApp al número de la firma, aunque la persona no pulse el botón de `/gracias`. Usa la WhatsApp Business Platform (Cloud API) y una plantilla aprobada por Meta (`solicitud_web_nueva`, 5 variables de texto: referencia, área, prioridad, nombre y teléfono). **Hoy está desactivado**: se activa al definir `WHATSAPP_TOKEN` y `WHATSAPP_SENDER_ID` en Vercel (ver `.env.example`). El número que envía debe ser distinto del que recibe (301 6515265). Si el envío falla, la solicitud queda guardada igual y el servidor lo anota en el registro (`aviso WhatsApp a la firma: error`).
- Sin número: el botón no se muestra y la página indica que el equipo contactará por el medio elegido.

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
| `form_step` | Paso completado (para ver dónde abandonan) | `formulario`, `paso` (`consulta`, `situacion`, `atencion`) | — |
| `generate_lead` | **Después** de que el servidor confirma el registro | `formulario`, `area`, `publico`, `prioridad`, `ruta` + `event_id` | `Lead` + `eventID` |
| `schedule_request` | Solicitud de consulta confirmada por el servidor | ídem | `Schedule` + `eventID` |
| `open_calendar` | Abre la agenda de Google Calendar en `/gracias` | `ubicacion`, `ruta` | — |
| `appointment_confirmed` | Calendly confirma una reserva (si se activa) | `formulario` | `Schedule` |

- **Deduplicación:** el `event_id` del navegador y el de la API de Conversiones es la referencia de la solicitud (`LX-…`).
- **Datos que nunca se envían:** nombre, teléfono, correo, ciudad, subcategoría ni detalles del caso. A Meta no se envía siquiera el área jurídica.
- **Nota para revisión:** la URL de la página (p. ej. `/divorcio-unilateral`) llega a las plataformas con el `PageView` cuando hay consentimiento. Validar con la firma.
- **Conversiones en Google Ads/Meta:** marcar `generate_lead`/`Lead` y `schedule_request`/`Schedule` como conversiones; no usar visitas a `/gracias`.
- **Pruebas A/B:** los textos viven en contenido (JSON/Markdown), por lo que pueden crearse variantes de landing (p. ej. `divorcio-unilateral-b`) con su propio `seo` y medir por `paginaOrigen`. Para pruebas aleatorias, integrar Vercel Edge Config o la herramienta que se apruebe.

## 6. Atribución

`src/lib/attribution.ts`: primer y último contacto (UTM, gclid, fbclid, landing sin parámetros, dominio de referencia). Se mantiene en memoria durante la visita y solo se guarda en el navegador (`lx_attr`, 90 días) con el consentimiento «Funcionales». Se adjunta únicamente a la solicitud que la persona envía.

## 7. Agendamiento

- **La agenda se ofrece al terminar el formulario**, nunca antes: primero se filtra. Prioridad alta → agenda como primera opción; media → como alternativa; baja → no se ofrece.
- **Google Calendar (elegido):** la firma crea una «agenda de citas» (*appointment schedule*) en su Google Calendar y copia el enlace de inserción (`https://calendar.google.com/calendar/appointments/schedules/…`) en Configuración → Agendamiento (`proveedor: google`, `googleCalendarUrl`). El sitio la muestra dentro de `/gracias` (se carga al pulsar «Ver horarios disponibles»; la política de seguridad permite `calendar.google.com`). El enlace corto `https://calendar.app.google/…` también sirve, pero se abre en otra pestaña. Solo se aceptan direcciones de Google.
  - Limitación: Google no avisa al sitio cuando se reserva. Las reservas se cuentan en el propio Calendar o con Zapier/Make hacia el CRM. La persona confirma su nombre y correo dentro de la agenda.
- **Calendly (alternativa):** `proveedor: calendly` y `calendlyUrl`. Sí avisa la reserva (`appointment_confirmed`).
- **Sin agenda configurada (estado actual):** el formulario de `/agendar-consulta` pide modalidad, hasta 3 fechas (mañana a 90 días) y franja; `/gracias` indica que el equipo contactará para acordar la fecha. Sin horarios ficticios, sin cobro, sin precio publicado.

## 8. Panel de contenidos

Decap CMS en `/admin` con flujo editorial (borrador → en revisión → listo).
Producción: crear una GitHub OAuth App con callback `https://<dominio>/api/cms/callback`, definir `GITHUB_OAUTH_CLIENT_ID/SECRET` y completar `repo`, `base_url` y `site_url` en `public/admin/config.yml`. Solo pueden guardar las cuentas con permiso de escritura en el repositorio.
