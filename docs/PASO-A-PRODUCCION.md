# Paso a producción

> No publicar en el dominio de producción ni reemplazar el sitio existente sin autorización expresa de LEXPERTISE.

## 0. Requisitos previos

- Todos los pendientes **críticos** de [PENDIENTES.md](PENDIENTES.md) resueltos.
- `NEXT_PUBLIC_SITE_ENV=production npm run check:contenido -- --estricto` termina sin bloqueantes.

## 1. Repositorio

1. Hecho: `https://github.com/segmentamkt/LEXPERTISE-COLOMBIA` (**público** por decisión de la agencia; los textos jurídicos sin aprobar y las notas internas quedan visibles). Dar permiso de escritura solo a las personas autorizadas o transferirlo a una cuenta de LEXPERTISE (si se transfiere, actualizar `repo` en `public/admin/config.yml`).
2. Proteger la rama `main` (revisión obligatoria de cambios de código).
3. Actualizar `base_url` y `site_url` en `public/admin/config.yml` (`repo` ya apunta al repositorio).

## 2. Base de datos de solicitudes

1. Crear un proyecto en Supabase (región recomendada: São Paulo o EE. UU. Este; confirmar la transferencia internacional en la política de datos).
2. Ejecutar `supabase/migrations/001_solicitudes.sql`.
3. Activar copias de seguridad (plan de pago con PITR o exportación periódica verificada).
4. Generar un secreto (`openssl rand -hex 32`), registrar su hash en `lexpertise.config` y guardar `SUPABASE_URL`, `SUPABASE_KEY` (publicable) y `SUPABASE_RPC_SECRET` solo como variables del servidor.

## 3. Staging (Vercel) — ya desplegado

- URL: `https://lexpertise-web.vercel.app` (proyecto `lexpertise-web`, equipo Segmenta, plan Hobby).
- Acceso: **público** desde el 14-nov-2026 por decisión de la agencia (`ssoProtection: null`), para que cualquier persona con la dirección pueda revisarlo. Sigue sin indexarse: `noindex` en la meta y en la cabecera, y `robots.txt` bloquea todo. Quedan a la vista los textos sin aprobar y los avisos «Pendiente», y el formulario guarda solicitudes reales en Supabase.
- Para volver a protegerlo: Vercel → proyecto → Settings → Deployment Protection → Vercel Authentication → «All Deployments» (o `PATCH /v9/projects/<id>` con `{"ssoProtection":{"deploymentType":"all"}}`).
- Para dar acceso a revisores de LEXPERTISE: invitarlos al equipo de Vercel o generar un enlace para compartir desde el panel del despliegue (expira).
- **Plan Hobby:** Vercel lo limita a uso no comercial. Sirve para revisión interna; la producción debe ir en un plan Pro o en la cuenta de LEXPERTISE.

Para un staging nuevo desde cero:

1. Importar el repositorio en Vercel (equipo de la agencia o de la firma, según se acuerde).
2. Variables: `NEXT_PUBLIC_SITE_ENV=staging`, `NEXT_PUBLIC_SITE_URL=https://<staging>`, `LEAD_STORE=supabase`, `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_RPC_SECRET`, `GITHUB_OAUTH_*`.
3. Activar **Deployment Protection** para **todos** los despliegues **antes** del primer despliegue (en Hobby, la protección estándar deja público el dominio `*.vercel.app` de producción).
4. Probar:
   ```bash
   BASE_URL=https://<staging> npm run test:enlaces
   ```
   ```bash
   BASE_URL=https://<staging> npm run test:formularios
   ```
   Si la protección de Vercel bloquea las pruebas automáticas, usar un *bypass token* de automatización.
5. Enviar una solicitud real de prueba y verificar que aparezca en Supabase y en el CRM.

## 4. Producción

1. Variables del entorno **Production**: `NEXT_PUBLIC_SITE_ENV=production`, `NEXT_PUBLIC_SITE_URL=https://<dominio>`, almacenamiento, `CRM_WEBHOOK_*`, `UPSTASH_*`, IDs de medición y `NEXT_PUBLIC_GSC_VERIFICATION`.
2. El build de producción ejecuta `prebuild`: si quedan bloqueantes, **se detiene**.
3. **Migración SEO** (si existe el sitio Odoo): exportar las URLs indexadas desde Search Console, mapearlas en `content/settings/redirecciones.json` (301) y probarlas en staging.
4. Conectar el dominio en Vercel y cambiar el DNS en una ventana acordada. Mantener el sitio anterior accesible hasta verificar.
5. Después de publicar:
   - Search Console: verificar la propiedad, enviar `https://<dominio>/sitemap.xml` y revisar la cobertura. **No afirmar que el sitio está indexado hasta que Search Console lo confirme.**
   - GA4/GTM y Meta: verificar en modo depuración que los eventos llegan solo después del consentimiento y que `generate_lead` se registra una vez por solicitud. Marcar `generate_lead`/`Lead` y `schedule_request`/`Schedule` como conversiones.
   - Lighthouse móvil en inicio, landings y contacto.
   - Revisar las cookies instaladas con cada combinación de preferencias y contrastarlas con la política de cookies.

## 5. Reversión

- Vercel permite volver a un despliegue anterior en un clic (Instant Rollback).
- Si el problema es de DNS, restaurar los registros anteriores (anotarlos antes del cambio).
