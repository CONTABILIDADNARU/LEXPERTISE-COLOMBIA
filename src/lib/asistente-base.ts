import type { BaseAsistente } from "./asistente";
import { getServiciosVisibles } from "./content";
import { enlaceTelefono, enlaceWhatsApp, inicio, sitio } from "./settings";

export type EnlacesAsistente = { whatsapp: string | null; telefono: string | null; instagram: string };

/**
 * Datos que el asistente usa para responder. Todo sale de lo que el sitio ya publica (preguntas frecuentes, páginas de
 * servicio visibles y datos de contacto): si algo cambia en el panel de contenidos, el asistente lo refleja.
 */
export function construirBaseAsistente(): { base: BaseAsistente; enlaces: EnlacesAsistente } {
  const instagram = sitio.redes.instagram.trim();
  let instagramUsuario = "";
  try {
    instagramUsuario = instagram ? (new URL(instagram).pathname.split("/").filter(Boolean)[0] ?? "") : "";
  } catch {
    instagramUsuario = "";
  }
  return {
    base: {
      marca: sitio.marca,
      faqs: inicio.faq.items.map(({ pregunta, respuesta }) => ({ pregunta, respuesta })),
      servicios: getServiciosVisibles().map((s) => ({ titulo: s.titulo, slug: s.slug, esArea: s.tipo === "area" })),
      contacto: {
        telefono: sitio.empresa.telefono,
        correo: sitio.empresa.correo,
        horario: sitio.empresa.horario,
        instagramUsuario,
      },
    },
    enlaces: { whatsapp: enlaceWhatsApp("general"), telefono: enlaceTelefono(), instagram: instagramUsuario ? instagram : "" },
  };
}
