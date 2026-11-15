# LEXPERTISE · Sitio web

Sitio comercial de LEXPERTISE, firma de servicios jurídicos en Colombia. Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.
Contenido editable en Markdown/JSON con un panel Decap CMS. Solicitudes guardadas de verdad (archivo local o Supabase) y enviadas al CRM por webhook firmado.

## Requisitos

- Node.js 20.9 o superior (probado con Node 24).
- npm 10 o superior.

## Instalación y uso local

```bash
npm install
cp .env.example .env.local   # ajustar valores; en local basta con LEAD_STORE=file
npm run dev                  # http://localhost:3000
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo. Las solicitudes se guardan en `data/solicitudes.jsonl`. |
| `npm run build` | Compila. Antes ejecuta la auditoría de contenidos; si `NEXT_PUBLIC_SITE_ENV=production` y hay bloqueantes, **detiene el build**. |
| `npm run start` | Sirve la compilación. |
| `npm run check:contenido` | Informe de datos pendientes, revisiones jurídicas y expresiones publicitarias a revisar. |
| `npm run test:enlaces` | Rastrea el sitio y verifica enlaces, H1, títulos, descripciones y canonical (`BASE_URL=...`). |
| `npm run test:formularios` | 18 pruebas de la API de solicitudes (`BASE_URL=...`). |
| `npm run cms` | Proxy local del panel de contenidos (abrir `http://localhost:3000/admin`). |

## Estructura

```
content/                 Contenido editable (lo modifica el panel /admin)
  servicios/*.md         Áreas, servicios y landings (frontmatter + Markdown)
  recursos/*.md          Artículos y videos educativos
  legal/*.md             Políticas legales con variables {{razonSocial}}, {{nit}}…
  legal/consentimientos.json   Textos de autorización versionados
  settings/sitio.json    Datos de la firma, consulta, agendamiento
  settings/whatsapp.json Número oficial y mensajes por página
  settings/inicio.json   Textos de la página de inicio y FAQ
  settings/redirecciones.json  Redirecciones 301 del sitio anterior
  equipo/*.json          Perfiles verificados del equipo
src/app/                 Rutas (App Router)
  [servicio]/            Plantilla única para las 12 páginas de servicio y landings
  api/solicitudes/       API de captación (validación, antispam, idempotencia, CRM)
  api/cms/               Login de GitHub para el panel
src/components/          Header, Navigation, LeadForm, FAQAccordion, ProcessSteps, ServiceCard…
src/lib/                 Contenido, SEO, áreas, consentimiento, medición, atribución, almacenamiento
scripts/                 Auditoría de contenidos y pruebas automáticas
supabase/migrations/     Tabla de solicitudes con RLS
public/admin/            Panel de contenidos (Decap CMS)
docs/                    Documentación del proyecto
```

## Entornos

`NEXT_PUBLIC_SITE_ENV` controla el comportamiento:

| | development / staging | production |
|---|---|---|
| Indexación | `noindex` (meta + cabecera + robots.txt bloquea todo) | indexable, sitemap en robots.txt |
| Marcadores «Pendiente» | visibles | ocultos |
| Páginas sin aprobación jurídica | visibles con aviso de borrador | **no se publican** |
| Artículos en borrador | visibles con aviso | solo `publicado` |
| Equipo sin perfiles verificados | aviso | la página devuelve 404 y sale del menú |
| Build con bloqueantes | permitido | **detenido** por `prebuild` |

## Repositorio

`https://github.com/segmentamkt/LEXPERTISE-COLOMBIA` (**público**, rama `main`: cualquiera puede leerlo; solo quienes tengan permiso de escritura pueden modificarlo). Los archivos `.env*` (salvo `.env.example`), `.vercel/` y `data/` no se versionan.

```bash
git clone https://github.com/segmentamkt/LEXPERTISE-COLOMBIA.git
```

## Despliegue

Ver [docs/PASO-A-PRODUCCION.md](docs/PASO-A-PRODUCCION.md).

El proyecto de Vercel **no está conectado** al repositorio: subir cambios a GitHub no despliega nada. El staging se despliega con la CLI.

**Staging actual:** `https://lexpertise-web.vercel.app` (proyecto `lexpertise-web`, equipo Segmenta en Vercel). Exige iniciar sesión con una cuenta de Vercel con acceso al equipo. Las solicitudes se guardan en Supabase (proyecto «Segmenta web», esquema privado `lexpertise`).

Para volver a desplegar el staging desde esta carpeta (ya vinculada con `.vercel/`):

```bash
npx vercel@65.16.0 --scope segmenta deploy --prod
```

Variables del staging en Vercel: `NEXT_PUBLIC_SITE_ENV=staging`, `NEXT_PUBLIC_SITE_URL`, `LEAD_STORE=supabase`, `SUPABASE_URL`, `SUPABASE_KEY` (publicable) y `SUPABASE_RPC_SECRET` (secreto).

> En Vercel el disco es efímero: **no usar `LEAD_STORE=file`** allí.
> En el proyecto de staging, el entorno «production» de Vercel **es el staging** (`NEXT_PUBLIC_SITE_ENV=staging`). La producción real debe ir en un proyecto con plan comercial y con `NEXT_PUBLIC_SITE_ENV=production`. Sin almacenamiento configurado, la API responde 503 y el formulario muestra un error (nunca un éxito falso).

## Documentación

- [docs/INTEGRACIONES.md](docs/INTEGRACIONES.md): CRM, WhatsApp, medición, eventos, Supabase, agendamiento.
- [docs/MANUAL-EQUIPO.md](docs/MANUAL-EQUIPO.md): cómo editar contenidos y aprobar páginas.
- [docs/ESPECIFICACION-CONTENIDOS.md](docs/ESPECIFICACION-CONTENIDOS.md): formato y reglas editoriales.
- [docs/INFORME-PRUEBAS.md](docs/INFORME-PRUEBAS.md): resultados de QA.
- [docs/PENDIENTES.md](docs/PENDIENTES.md): pendientes reales por criticidad.
- [docs/PASO-A-PRODUCCION.md](docs/PASO-A-PRODUCCION.md): instrucciones de salida a producción.
