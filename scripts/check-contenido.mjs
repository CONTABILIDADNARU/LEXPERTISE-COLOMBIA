#!/usr/bin/env node
/**
 * Auditoría de contenidos y datos pendientes.
 *   node scripts/check-contenido.mjs              → informe
 *   node scripts/check-contenido.mjs --estricto   → además falla (exit 1) si hay bloqueantes
 *   node scripts/check-contenido.mjs --si-produccion → estricto solo si NEXT_PUBLIC_SITE_ENV=production
 * Se ejecuta automáticamente antes de cada build (prebuild).
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const C = (p) => join(ROOT, "content", p);
const args = new Set(process.argv.slice(2));
const estricto = args.has("--estricto") || (args.has("--si-produccion") && process.env.NEXT_PUBLIC_SITE_ENV === "production");

const hallazgos = { BLOQUEANTE: [], IMPORTANTE: [], INFORMATIVO: [] };
const add = (nivel, msg) => hallazgos[nivel].push(msg);

const leerMd = (dir) =>
  existsSync(C(dir))
    ? readdirSync(C(dir))
        .filter((f) => f.endsWith(".md"))
        .map((f) => ({ archivo: `${dir}/${f}`, ...matter(readFileSync(C(`${dir}/${f}`), "utf8")) }))
    : [];
const json = (p) => JSON.parse(readFileSync(C(p), "utf8"));

// Expresiones que la publicidad jurídica debe evitar (Ley 1123 de 2007). Se omiten negaciones ("no se garantizan").
const PROHIBIDAS = [
  /garantiza\w*/i,
  /\bganamos\b/i,
  /\bexpert[oa]s\b/i,
  /\blos mejores\b/i,
  /\blíder(es)?\b/i,
  /\bespecialistas? en\b/i,
  /\b100\s?%/i,
  /\bgratis\b|\bgratuit[oa]s?\b/i,
  /\bamplia (trayectoria|experiencia)\b/i,
  /\baños de experiencia\b/i,
  /\béxito\b/i,
];
function revisarTexto(archivo, texto) {
  for (const re of PROHIBIDAS) {
    const g = new RegExp(re.source, "gi");
    let m;
    while ((m = g.exec(texto))) {
      const contexto = texto.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, " ");
      if (/\bno\b[^.]{0,30}$/i.test(texto.slice(Math.max(0, m.index - 35), m.index)) || /\bsin\s+$/i.test(texto.slice(m.index - 5, m.index))) continue;
      add("IMPORTANTE", `${archivo}: expresión a revisar «${m[0]}» → …${contexto}…`);
    }
  }
}

const len = (s) => [...(s ?? "")].length;

// ── Servicios ────────────────────────────────────────────────────────────
const servicios = leerMd("servicios");
const slugs = new Set(servicios.map((s) => s.data.slug));
for (const s of servicios) {
  const d = s.data;
  if (d.revision?.estado !== "aprobado") add("BLOQUEANTE", `${s.archivo}: pendiente de aprobación jurídica (en producción no se publica).`);
  if (d.estado !== "activo") add("INFORMATIVO", `${s.archivo}: disponibilidad comercial «${d.estado}».`);
  if (len(d.seo?.title) > 60) add("IMPORTANTE", `${s.archivo}: seo.title tiene ${len(d.seo.title)} caracteres (máx. 60).`);
  const dl = len(d.seo?.description);
  if (dl < 120 || dl > 155) add("IMPORTANTE", `${s.archivo}: seo.description tiene ${dl} caracteres (120–155).`);
  for (const r of d.relacionados ?? []) if (!slugs.has(r)) add("IMPORTANTE", `${s.archivo}: relacionado inexistente «${r}».`);
  for (const n of d.notasRevision ?? []) add("INFORMATIVO", `${s.archivo}: nota para el abogado → ${n}`);
  revisarTexto(s.archivo, `${d.h1} ${d.subtitulo} ${d.resumen} ${JSON.stringify(d.faqs ?? [])} ${s.content}`);
}

// ── Recursos ─────────────────────────────────────────────────────────────
for (const r of leerMd("recursos")) {
  const d = r.data;
  if (d.estado !== "publicado") add("INFORMATIVO", `${r.archivo}: estado «${d.estado}» (no visible en producción).`);
  if (d.estado === "publicado" && (!d.fechaRevisionJuridica || !d.autor)) add("BLOQUEANTE", `${r.archivo}: publicado sin autor verificado o sin fecha de revisión jurídica.`);
  if (len(d.seo?.title) > 60) add("IMPORTANTE", `${r.archivo}: seo.title tiene ${len(d.seo.title)} caracteres (máx. 60).`);
  for (const rel of d.relacionados ?? []) if (!slugs.has(rel)) add("IMPORTANTE", `${r.archivo}: relacionado inexistente «${rel}».`);
  revisarTexto(r.archivo, `${d.titulo} ${d.extracto} ${r.content}`);
}

// ── Legales ──────────────────────────────────────────────────────────────
for (const l of leerMd("legal")) {
  if (l.data.revision?.estado !== "aprobado") add("BLOQUEANTE", `${l.archivo}: documento legal sin aprobación jurídica.`);
  if (!l.data.vigenteDesde) add("BLOQUEANTE", `${l.archivo}: falta la fecha de vigencia.`);
}

// ── Configuración ────────────────────────────────────────────────────────
const sitio = json("settings/sitio.json");
const e = sitio.empresa;
const obligatorios = { razonSocial: "Razón social", nit: "NIT", correo: "Correo oficial", correoDatos: "Correo para datos personales", telefono: "Teléfono oficial" };
for (const [k, label] of Object.entries(obligatorios)) if (!e[k]) add("BLOQUEANTE", `settings/sitio.json: falta ${label}.`);
if (!e.horario) add("IMPORTANTE", "settings/sitio.json: falta horario de atención.");
if (!sitio.verificado) add("IMPORTANTE", "settings/sitio.json: datos no marcados como verificados (no se emite marcado LegalService).");
if (!sitio.consulta.confirmada || !sitio.consulta.duracion) add("INFORMATIVO", "settings/sitio.json: duración de la consulta sin confirmar (no se publica).");
if (!sitio.consulta.modalidades.length) add("IMPORTANTE", "settings/sitio.json: modalidades de atención sin confirmar.");
if (!Object.values(sitio.redes).some(Boolean)) add("INFORMATIVO", "settings/sitio.json: redes sociales oficiales sin verificar.");
const ag = sitio.agendamiento;
const agendaOk =
  (ag.proveedor === "google" && /^https:\/\/(calendar\.google\.com\/calendar\/appointments\/schedules\/|calendar\.app\.google\/)/.test(ag.googleCalendarUrl ?? "")) ||
  (ag.proveedor === "calendly" && /^https:\/\/calendly\.com\//.test(ag.calendlyUrl ?? ""));
if (!agendaOk)
  add("IMPORTANTE", "settings/sitio.json: sin agenda en línea (Google Calendar o Calendly). Los casos de prioridad alta no pueden agendar al terminar el formulario: se piden fechas posibles.");
const wa = json("settings/whatsapp.json");
if (wa.numero.replace(/\D/g, "").length < 10) add("BLOQUEANTE", "settings/whatsapp.json: falta el número oficial de WhatsApp.");
const inicio = json("settings/inicio.json");
for (const f of inicio.faq.items) if (f.pendiente) add("IMPORTANTE", `settings/inicio.json: FAQ «${f.pregunta}» → pendiente: ${f.pendiente}.`);
const equipo = existsSync(C("equipo")) ? readdirSync(C("equipo")).filter((f) => f.endsWith(".json")) : [];
if (!equipo.length) add("INFORMATIVO", "content/equipo: sin perfiles verificados (la página /equipo muestra el texto general de áreas, como pidió la firma).");
const nosotros = matter(readFileSync(C("paginas/nosotros.md"), "utf8"));
if (nosotros.data.revision?.estado !== "aprobado") add("BLOQUEANTE", "paginas/nosotros.md: pendiente de aprobación.");
const cms = readFileSync(join(ROOT, "public/admin/config.yml"), "utf8");
if (cms.includes("PENDIENTE")) add("IMPORTANTE", "public/admin/config.yml: repositorio o dominio del panel de contenidos sin configurar.");

// ── Variables de entorno (solo se exigen en producción) ───────────────────
if (estricto) {
  const env = process.env;
  if (!env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")) add("BLOQUEANTE", "NEXT_PUBLIC_SITE_URL debe ser la URL https de producción.");
  if (env.LEAD_STORE === "supabase" ? !(env.SUPABASE_URL && env.SUPABASE_KEY && env.SUPABASE_RPC_SECRET) : env.LEAD_STORE !== "file")
    add("BLOQUEANTE", "Almacenamiento de solicitudes sin configurar (LEAD_STORE + credenciales).");
  if (!env.CRM_WEBHOOK_URL) add("IMPORTANTE", "CRM_WEBHOOK_URL sin configurar: las solicitudes no llegarán al CRM.");
}

// ── Informe ──────────────────────────────────────────────────────────────
const total = Object.values(hallazgos).reduce((a, l) => a + l.length, 0);
console.log(`\nAuditoría de contenidos LEXPERTISE · ${new Date().toISOString().slice(0, 10)} · ${estricto ? "modo estricto (producción)" : "modo informe"}\n`);
for (const [nivel, lista] of Object.entries(hallazgos)) {
  if (!lista.length) continue;
  console.log(`■ ${nivel} (${lista.length})`);
  for (const m of lista) console.log(`  - ${m}`);
  console.log("");
}
console.log(`Total: ${total} hallazgos · ${hallazgos.BLOQUEANTE.length} bloqueantes para producción.\n`);
if (estricto && hallazgos.BLOQUEANTE.length) {
  console.error("✖ Build de producción detenido: resuelve los bloqueantes o despliega como staging.");
  process.exit(1);
}
