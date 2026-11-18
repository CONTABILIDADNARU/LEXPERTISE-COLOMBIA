# Pendientes reales (actualizado 2026-11-17)

Listado vivo: `npm run check:contenido` lo recalcula a partir del contenido. **Crítico** = bloquea la salida a producción (el build de producción se detiene).

## Crítico: datos y decisiones de LEXPERTISE

| # | Pendiente | Dónde se completa |
|---|---|---|
| C1 | **Razón social:** LEXPERTISE COLOMBIA S.A.S. **NIT:** 901.800.715-9 (RUT; dígito de verificación válido). **Domicilio:** Bogotá. **Dirección física:** el 18-nov-2026 la agencia pidió que no aparezca en ningún lugar del sitio (se retiró del contacto, el pie, los datos estructurados y las políticas; el campo ya no existe en el panel). Para volver a mostrarla: revertir el commit de ese día. **Pendiente de la firma:** el PDF de la política de datos dice NIT 900.801.715-9 y trae dos números distintos de dirección. Corregir el PDF; revisión jurídica debe confirmar si la política puede omitir la dirección del responsable (Decreto 1377 de 2013, art. 13). | Configuración → Datos de la firma |
| C2 | Correo general **lexpertisesas@gmail.com** (cancelaciones) y correo de datos personales **lexpertisea@gmail.com** (política de datos): confirmar que ambos son de la firma. Teléfono **+57 301 6515265**. | Configuración → Datos de la firma |
| C3 | ~~Número oficial de WhatsApp~~: **+57 301 6515265**, configurado el 17-nov. | Hecho |
| C4 | **Aprobación jurídica** de las 12 páginas de servicio (cada una con sus `notasRevision`) y de «La firma». | Áreas y servicios / Páginas institucionales |
| C5 | Aprobación y fecha de vigencia de las 4 políticas legales. | Documentos legales |
| C6 | Almacenamiento de producción: proyecto Supabase **dedicado** de LEXPERTISE + migración `001_solicitudes.sql`. El staging usa un esquema aislado dentro de «Segmenta web» por el límite de 2 proyectos gratuitos. | Supabase + variables de entorno |
| C8 | Cuenta o plan de Vercel apto para uso comercial (el staging está en el plan Hobby del equipo Segmenta). | Decisión de la firma/agencia |
| C7 | Dominio definitivo, URL de producción y autorización expresa para publicar. | Decisión de la firma |

## Alto

| # | Pendiente |
|---|---|
| A1 | **CRM:** identificar el CRM real de LEXPERTISE, su API/webhook, etapas, asignación y manejo de duplicados. Configurar `CRM_WEBHOOK_URL/SECRET`. El CRM conectado a esta cuenta no se usó porque no se pudo verificar que sea de la firma. |
| A2 | **Sitio anterior (Odoo):** no se encontró el dominio ni páginas indexadas. Si existe, exportar URLs de Search Console y cargar redirecciones 301 antes de cambiar el DNS. |
| A3 | Modalidades de atención (virtual, presencial, telefónica) y ciudades con atención presencial. La dirección no se publica. |
| A4 | Tiempo de respuesta comprometido a las solicitudes. |
| A5 | Consulta: **90 minutos**; el valor **no se publica** (decisión de la firma, 17-nov) y se informa por WhatsApp. Política de cancelación y reprogramación **con el texto de la firma** (17-nov), con casilla obligatoria. Falta su fecha de vigencia y qué pasa con cancelaciones o reprogramaciones fuera de plazo. Faltan los medios de pago. |
| A6 | Perfiles verificados del equipo con fotografías reales. Mientras tanto, por pedido de la firma, /equipo dice de forma general que se cubren todas las áreas. |
| A7 | Confirmar si la firma presta **asuntos societarios** y un modelo de **acompañamiento recurrente** a empresas. |
| A8 | Repositorio: `CONTABILIDADNARU/LEXPERTISE-COLOMBIA` (público; transferido desde `segmentamkt` el 17-nov). Proyecto de Vercel: transferencia solicitada a la cuenta nueva (enlace válido 24 horas). Falta: aceptar ambas transferencias, conectar el proyecto de Vercel con el repositorio, GitHub OAuth App y `base_url`/`site_url` del panel (`public/admin/config.yml`), y proteger la rama `main`. |
| A9 | Límite de envíos global en Vercel (Upstash Redis) para que el límite por IP no dependa de una sola instancia. |
| A11 | ~~Token para pruebas automáticas~~: ya no hace falta, porque el staging es público desde el 14-nov. Si se vuelve a proteger, lo debe crear una persona del equipo en Vercel. |
| A10 | **Meta:** píxel creado el 17-nov en el portafolio «Lexpertise Colombia S.A.S.» (conjunto de datos «LEXPERTISE Colombia - Sitio web», ID 1117529520916301, conectado a la cuenta publicitaria LEXPERTISE) y cargado en el sitio con `NEXT_PUBLIC_META_PIXEL_ID`; solo se activa si la persona acepta cookies de marketing. Falta: GA4 o GTM, Search Console, y la API de Conversiones (hay que generar un token en Meta y definir `META_PIXEL_ID` y `META_CAPI_TOKEN`). |
| A15 | ~~Fundación~~: retirada del sitio por decisión de la firma (17-nov). La fundación hará su propia publicidad; LEXPERTISE no la menciona. |
| A12 | **Agenda de citas de Google Calendar:** crear la agenda en la cuenta de la firma y pegar el enlace de inserción en Configuración → Agendamiento (ver `MANUAL-EQUIPO.md` §7b). Sin ella, los casos de prioridad alta no pueden agendar al terminar y el formulario pide fechas posibles. |
| A13 | Áreas o asuntos prioritarios para la firma, para ajustar la regla de prioridad alta (`src/lib/leads/prioridad.ts`). |
| A14 | Si se aprueba: evento «lead calificado» para Meta y Google (prioridad alta). |

## Medio: validaciones jurídicas señaladas en la redacción

| # | Punto |
|---|---|
| M1 | Ley 2442 de 2024: procedimiento de la causal 10 (la ley no fija uno; se asumió proceso verbal ante juez de familia), alcance de la oposición «al contenido de la propuesta», articulación del paso a notaría (art. 7) y demandas de inconstitucionalidad en trámite (solo se halló el Auto 705 de 2025, que rechazó una demanda). |
| M2 | Divorcio notarial: un abogado para ambos cónyuges, liquidación de la sociedad conyugal en la misma escritura, cita del Decreto 4436 de 2005 compilado. |
| M3 | Decreto 902 de 1988 (sucesión notarial) frente a la Ley 1996 de 2019 y herederos menores de edad. |
| M4 | Laboral: vigencia del nuevo Código Procesal del Trabajo (Ley 2452 de 2025) y de la reforma laboral (Ley 2466 de 2025) en los textos; prescripción en seguridad social. |
| M5 | Tributario: alcance exacto del servicio (orientación, respuesta a requerimientos, recursos, representación; tributos nacionales y/o territoriales). |
| M6 | Propiedad intelectual: si la firma radica ante la SIC, atiende oposiciones o cancelaciones, y otros derechos (autor, patentes). |
| M7 | Datos personales: canal y responsable de peticiones, inscripción en el RNBD, lista de proveedores (encargados) y países —incluye Google si se usa la agenda de Google Calendar—, plazos de conservación, alcance de la política frente a clientes/empleados/proveedores. |
| M8 | Medición: la URL de la página (p. ej. `/divorcio-unilateral`) llega a Google/Meta con el consentimiento de la persona. La atribución se adjunta a la solicitud enviada aunque no se acepten cookies funcionales (no se guarda en el navegador). Confirmar ambos criterios. |
| M9 | Revisión deontológica (Ley 1123 de 2007, art. 31) de todos los textos publicitarios y de cualquier campaña. |

## Bajo / mejoras posteriores

| # | Mejora |
|---|---|
| B1 | Manual de marca oficial. Desde el 18-nov-2026 el sitio usa el triángulo y los colores del logotipo que envió la firma (turquesa, cian, azul cielo y gris); falta confirmar tipografías, versiones del logotipo (horizontal, vertical, fondo oscuro) y usos permitidos. |
| B2 | Content-Security-Policy con nonce (hoy permite scripts en línea, necesarios para Next.js sin renderizado dinámico). |
| B3 | Vista previa con estilos del sitio dentro del panel de contenidos. |
| B4 | Imágenes de Open Graph por página y fotografías institucionales. |
| B5 | Notificación por correo al equipo por cada solicitud (puede hacerse desde el CRM o el orquestador). |
| B6 | Pruebas A/B de titulares de las landings (la estructura de contenido lo permite). |
