/**
 * Carga y valida el contenido editable (Markdown/JSON en /content).
 * Se ejecuta solo en el servidor durante la compilación. Un archivo inválido detiene el build
 * con un mensaje que indica el archivo y el campo.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { AREA_KEYS } from "./areas";
import { IS_PRODUCTION } from "./env";
import { WHATSAPP_CONTEXTOS } from "./settings";

const ROOT = join(process.cwd(), "content");

// YAML convierte 2026-11-13 en Date y los campos vacíos en null: se normalizan aquí.
const str = z.preprocess((v) => (v == null ? "" : v instanceof Date ? v.toISOString().slice(0, 10) : v), z.string());
const fecha = str.refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Formato de fecha AAAA-MM-DD");
const lista = <T extends z.ZodTypeAny>(s: T) => z.preprocess((v) => (v == null ? [] : v), z.array(s));

const Faq = z.object({ pregunta: z.string().min(5), respuesta: z.string().min(10).max(1200) });
const Fuente = z.object({ nombre: z.string().min(2), url: z.url() });
const Revision = z.object({ estado: z.enum(["pendiente", "aprobado"]), abogado: str, fecha });
const Seo = z.object({ title: z.string().min(10).max(80), description: z.string().min(50).max(200) });

export const ServicioSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  tipo: z.enum(["area", "servicio", "landing"]),
  area: z.enum(AREA_KEYS),
  audiencia: z.array(z.enum(["personas", "empresas"])).min(1),
  estado: z.enum(["activo", "por-confirmar", "oculto"]),
  orden: z.number().default(100),
  titulo: z.string().min(3).max(60),
  h1: z.string().min(5),
  subtitulo: z.string().max(320),
  resumen: z.string().max(220),
  seo: Seo,
  pasos: lista(z.object({ titulo: z.string(), texto: z.string().max(400) })),
  documentos: lista(z.string()),
  faqs: lista(Faq),
  relacionados: lista(z.string()),
  whatsapp: z.enum(WHATSAPP_CONTEXTOS).default("general"),
  fuentes: lista(Fuente),
  notasRevision: lista(z.string()),
  revision: Revision,
  actualizado: fecha,
});
export type Servicio = z.infer<typeof ServicioSchema> & { cuerpo: string };

export const RecursoSchema = z.object({
  titulo: z.string().min(5),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  extracto: z.string().max(260),
  categoria: z.enum(AREA_KEYS),
  autor: str,
  fechaPublicacion: fecha,
  fechaRevisionJuridica: fecha,
  imagen: str,
  video: z
    .preprocess((v) => (v == null ? undefined : v), z.object({ plataforma: str, url: str }).optional())
    .transform((v) => (v && v.url ? v : undefined)),
  preguntaPrincipal: str,
  seo: Seo,
  estado: z.enum(["borrador", "revision", "publicado"]),
  relacionados: lista(z.string()),
  faqs: lista(Faq),
  fuentes: lista(Fuente),
  notasRevision: lista(z.string()),
  actualizado: fecha,
});
export type Recurso = z.infer<typeof RecursoSchema> & { cuerpo: string };

export const LegalSchema = z.object({
  titulo: z.string(),
  slug: z.string(),
  version: z.string(),
  vigenteDesde: fecha,
  seo: Seo,
  notasRevision: lista(z.string()),
  revision: Revision,
});
export type DocumentoLegal = z.infer<typeof LegalSchema> & { cuerpo: string };

export const PaginaSchema = z.object({
  titulo: z.string(),
  h1: z.string(),
  subtitulo: z.string(),
  seo: Seo,
  revision: Revision,
  actualizado: fecha,
});
export type Pagina = z.infer<typeof PaginaSchema> & { cuerpo: string };

export const MiembroSchema = z.object({
  nombre: z.string().min(3),
  cargo: z.string(),
  tarjetaProfesional: str,
  areas: lista(z.enum(AREA_KEYS)),
  formacion: lista(z.string()),
  perfil: str,
  foto: str,
  orden: z.number().default(100),
  verificado: z.boolean(),
});
export type Miembro = z.infer<typeof MiembroSchema>;

function leerCarpeta<T extends z.ZodTypeAny>(carpeta: string, schema: T): (z.infer<T> & { cuerpo: string })[] {
  const dir = join(ROOT, carpeta);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((archivo) => {
      const { data, content } = matter(readFileSync(join(dir, archivo), "utf8"));
      const res = schema.safeParse(data);
      if (!res.success) {
        const detalle = res.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
        throw new Error(`Contenido inválido en content/${carpeta}/${archivo} → ${detalle}`);
      }
      const slugArchivo = archivo.replace(/\.md$/, "");
      if ((res.data as { slug?: string }).slug && (res.data as { slug: string }).slug !== slugArchivo) {
        throw new Error(`content/${carpeta}/${archivo}: el slug "${(res.data as { slug: string }).slug}" no coincide con el nombre del archivo`);
      }
      return { ...(res.data as object), cuerpo: content.trim() } as z.infer<T> & { cuerpo: string };
    });
}

let cacheServicios: Servicio[] | null = null;
let cacheRecursos: Recurso[] | null = null;

export function getServicios(): Servicio[] {
  cacheServicios ??= leerCarpeta("servicios", ServicioSchema).sort((a, b) => a.orden - b.orden);
  return cacheServicios;
}

/** Una página de servicio se publica si está activa y, en producción, si tiene aprobación jurídica. */
export function servicioVisible(s: Servicio): boolean {
  if (s.estado === "oculto") return false;
  if (IS_PRODUCTION) return s.estado === "activo" && s.revision.estado === "aprobado";
  return true;
}

export function getServiciosVisibles(): Servicio[] {
  return getServicios().filter(servicioVisible);
}

export function getServicio(slug: string): Servicio | undefined {
  return getServicios().find((s) => s.slug === slug);
}

export function getAreasPrincipales(): Servicio[] {
  return getServiciosVisibles().filter((s) => s.tipo === "area");
}

export function getRecursos(): Recurso[] {
  cacheRecursos ??= leerCarpeta("recursos", RecursoSchema).sort((a, b) =>
    (b.fechaPublicacion || b.actualizado).localeCompare(a.fechaPublicacion || a.actualizado),
  );
  return cacheRecursos;
}

/** En producción solo se muestran artículos publicados; en revisión se ven todos con aviso. */
export function recursoVisible(r: Recurso): boolean {
  return IS_PRODUCTION ? r.estado === "publicado" : true;
}

export function getRecursosVisibles(): Recurso[] {
  return getRecursos().filter(recursoVisible);
}

export function getRecurso(slug: string): Recurso | undefined {
  return getRecursos().find((r) => r.slug === slug);
}

export function getDocumentoLegal(slug: string): DocumentoLegal {
  const doc = leerCarpeta("legal", LegalSchema).find((d) => d.slug === slug);
  if (!doc) throw new Error(`Falta el documento legal content/legal/${slug}.md`);
  return doc;
}

export function getPagina(nombre: string): Pagina {
  const archivo = join(ROOT, "paginas", `${nombre}.md`);
  const { data, content } = matter(readFileSync(archivo, "utf8"));
  const res = PaginaSchema.safeParse(data);
  if (!res.success) throw new Error(`Contenido inválido en content/paginas/${nombre}.md → ${res.error.message}`);
  return { ...res.data, cuerpo: content.trim() };
}

export function getEquipo(): Miembro[] {
  const dir = join(ROOT, "equipo");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const res = MiembroSchema.safeParse(JSON.parse(readFileSync(join(dir, f), "utf8")));
      if (!res.success) throw new Error(`content/equipo/${f} inválido → ${res.error.message}`);
      return res.data;
    })
    .filter((m) => m.verificado)
    .sort((a, b) => a.orden - b.orden);
}
