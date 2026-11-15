import { subcategoriasValidas, type Publico } from "../areas";
import type { Etapa, Prioridad, Ruta, Urgencia } from "./opciones";

type Entrada = { publico: Publico; area: string; subcategoria: string; etapa: Etapa; urgencia: Urgencia };
export type Clasificacion = { prioridad: Prioridad; ruta: Ruta; motivo: string };

const RUTA: Record<Prioridad, Ruta> = { alta: "agendar", media: "conversar", baja: "informar" };

/**
 * Prioridad de una solicitud según su necesidad, etapa y urgencia.
 * Nunca descarta a nadie: todas las solicitudes se guardan y la prioridad solo ordena la atención
 * y decide el siguiente paso que se ofrece (agenda, WhatsApp o recursos). No usa datos económicos
 * ni personales.
 */
export function clasificar(d: Entrada): Clasificacion {
  const r = (prioridad: Prioridad, motivo: string): Clasificacion => ({ prioridad, ruta: RUTA[prioridad], motivo });

  if (d.etapa === "informarse") return r("baja", "Por ahora solo quiere informarse");
  if (d.area === "otro") return r("media", "No sabe qué área corresponde: requiere revisión de una persona");

  const subcategorias = subcategoriasValidas(d.area, d.publico);
  const asuntoDefinido = subcategorias.length === 0 || (d.subcategoria !== "" && d.subcategoria !== "otro");
  if (!asuntoDefinido) return r("media", "Tipo de asunto sin definir");

  if (d.etapa === "fecha-limite") return r("alta", "Fecha límite o audiencia próxima");
  if (d.urgencia === "inmediata" || d.urgencia === "este-mes") return r("alta", "Necesidad definida y quiere avanzar pronto");
  return r("media", "Necesidad definida, sin urgencia inmediata");
}
