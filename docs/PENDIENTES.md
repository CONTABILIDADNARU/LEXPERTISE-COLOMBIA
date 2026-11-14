# Pendientes reales (2026-11-13)

Listado vivo: `npm run check:contenido` lo recalcula a partir del contenido. **Crítico** = bloquea la salida a producción (el build de producción se detiene).

## Crítico: datos y decisiones de LEXPERTISE

| # | Pendiente | Dónde se completa |
|---|---|---|
| C1 | Razón social y NIT verificados (atención: existen organizaciones con nombres parecidos). | Configuración → Datos de la firma |
| C2 | Correo oficial, correo para datos personales y teléfono oficial. | Configuración → Datos de la firma |
| C3 | Número oficial de WhatsApp. | Configuración → WhatsApp |
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
| A3 | Modalidades de atención (virtual, presencial, telefónica), ciudades con atención presencial y dirección. |
| A4 | Tiempo de respuesta comprometido a las solicitudes. |
| A5 | Precio, duración, alcance y condiciones de la consulta (la cifra preliminar de COP 200.000–300.000 **no** se publicó). Política de cancelación y reprogramación. |
| A6 | Perfiles verificados del equipo con fotografías reales (la página /equipo no se publica sin ellos). |
| A7 | Confirmar si la firma presta **asuntos societarios** y un modelo de **acompañamiento recurrente** a empresas. |
| A8 | Repositorio creado: `segmentamkt/LEXPERTISE` (público). Falta: GitHub OAuth App, `base_url`/`site_url` del panel (`public/admin/config.yml`), proteger la rama `main` y decidir si el repositorio pasa a una cuenta de LEXPERTISE. |
| A9 | Límite de envíos global en Vercel (Upstash Redis) para que el límite por IP no dependa de una sola instancia. |
| A11 | Pruebas automáticas sobre el staging protegido: requieren un token de omisión para automatización que debe crear una persona del equipo en Vercel (Settings → Deployment Protection). Mientras tanto, revisar el staging con sesión de Vercel. |
| A10 | Cuentas de medición: GA4 o GTM, Píxel de Meta, Search Console y, si se aprueba, API de Conversiones. |

## Medio: validaciones jurídicas señaladas en la redacción

| # | Punto |
|---|---|
| M1 | Ley 2442 de 2024: procedimiento de la causal 10 (la ley no fija uno; se asumió proceso verbal ante juez de familia), alcance de la oposición «al contenido de la propuesta», articulación del paso a notaría (art. 7) y demandas de inconstitucionalidad en trámite (solo se halló el Auto 705 de 2025, que rechazó una demanda). |
| M2 | Divorcio notarial: un abogado para ambos cónyuges, liquidación de la sociedad conyugal en la misma escritura, cita del Decreto 4436 de 2005 compilado. |
| M3 | Decreto 902 de 1988 (sucesión notarial) frente a la Ley 1996 de 2019 y herederos menores de edad. |
| M4 | Laboral: vigencia del nuevo Código Procesal del Trabajo (Ley 2452 de 2025) y de la reforma laboral (Ley 2466 de 2025) en los textos; prescripción en seguridad social. |
| M5 | Tributario: alcance exacto del servicio (orientación, respuesta a requerimientos, recursos, representación; tributos nacionales y/o territoriales). |
| M6 | Propiedad intelectual: si la firma radica ante la SIC, atiende oposiciones o cancelaciones, y otros derechos (autor, patentes). |
| M7 | Datos personales: canal y responsable de peticiones, inscripción en el RNBD, lista de proveedores (encargados) y países, plazos de conservación, alcance de la política frente a clientes/empleados/proveedores. |
| M8 | Medición: la URL de la página (p. ej. `/divorcio-unilateral`) llega a Google/Meta con el consentimiento de la persona. La atribución se adjunta a la solicitud enviada aunque no se acepten cookies funcionales (no se guarda en el navegador). Confirmar ambos criterios. |
| M9 | Revisión deontológica (Ley 1123 de 2007, art. 31) de todos los textos publicitarios y de cualquier campaña. |

## Bajo / mejoras posteriores

| # | Mejora |
|---|---|
| B1 | Manual de marca, logotipo y paleta oficial (hoy la identidad es provisional). |
| B2 | Content-Security-Policy con nonce (hoy permite scripts en línea, necesarios para Next.js sin renderizado dinámico). |
| B3 | Vista previa con estilos del sitio dentro del panel de contenidos. |
| B4 | Imágenes de Open Graph por página y fotografías institucionales. |
| B5 | Notificación por correo al equipo por cada solicitud (puede hacerse desde el CRM o el orquestador). |
| B6 | Pruebas A/B de titulares de las landings (la estructura de contenido lo permite). |
