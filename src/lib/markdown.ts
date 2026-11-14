import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { IS_PRODUCTION, SITE_URL } from "./env";
import { sitio } from "./settings";

/**
 * Convierte Markdown en HTML seguro: el HTML incrustado se elimina (rehype-sanitize) y los
 * encabezados reciben un id para enlazarlos (rehype-slug, después de sanear para que el id quede limpio).
 */
export async function renderMarkdown(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(md);
  return String(file);
}

const VARIABLES: Record<string, { valor: () => string; etiqueta: string }> = {
  marca: { valor: () => sitio.marca, etiqueta: "Marca" },
  razonSocial: { valor: () => sitio.empresa.razonSocial, etiqueta: "Razón social" },
  nit: { valor: () => sitio.empresa.nit, etiqueta: "NIT" },
  direccion: { valor: () => sitio.empresa.direccion, etiqueta: "Dirección" },
  ciudad: { valor: () => sitio.empresa.ciudad, etiqueta: "Ciudad" },
  correo: { valor: () => sitio.empresa.correo, etiqueta: "Correo de contacto" },
  correoDatos: { valor: () => sitio.empresa.correoDatos || sitio.empresa.correo, etiqueta: "Correo para datos personales" },
  telefono: { valor: () => sitio.empresa.telefono, etiqueta: "Teléfono" },
  sitioUrl: { valor: () => SITE_URL, etiqueta: "URL del sitio" },
  fechaVigencia: { valor: () => "", etiqueta: "Fecha de entrada en vigencia" },
};

/**
 * Reemplaza {{variables}} con los datos oficiales configurados. Mientras falten, deja un marcador
 * visible en revisión. En producción el build se bloquea antes (scripts/check-contenido.mjs --estricto).
 */
export function reemplazarVariables(texto: string, extra: Record<string, string> = {}): string {
  return texto.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, clave: string) => {
    const valor = extra[clave] ?? VARIABLES[clave]?.valor() ?? "";
    if (valor) return valor;
    const etiqueta = VARIABLES[clave]?.etiqueta ?? clave;
    return IS_PRODUCTION ? "" : `**[PENDIENTE: ${etiqueta}]**`;
  });
}
