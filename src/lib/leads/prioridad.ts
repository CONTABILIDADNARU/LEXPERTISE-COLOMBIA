import { subcategoriasValidas, type Publico } from "../areas";
import type { Etapa, PagoRegistrable, Prioridad, Ruta, Urgencia } from "./opciones";

type Entrada = { publico: Publico; area: string; subcategoria: string; etapa: Etapa; urgencia: Urgencia; pago: PagoRegistrable };
export type Clasificacion = { prioridad: Prioridad; ruta: Ruta; motivo: string };

/**
 * Prioridad y siguiente paso de una solicitud.
 * - Ruta: quien puede pagar la consulta envía su solicitud de cita por WhatsApp («agendar»);
 *   quien quiere conversar la forma de pago escribe por WhatsApp («conversar»).
 *   (El sitio no publica el valor de la consulta ni remite a terceros: decisión de la firma, 17-nov-2026.)
 * - Prioridad: ordena la atención según necesidad, etapa y urgencia. No descarta a nadie.
 */
export function clasificar(d: Entrada): Clasificacion {
  const ruta: Ruta = d.pago === "puede" ? "agendar" : "conversar";
  const r = (prioridad: Prioridad, motivo: string): Clasificacion => ({ prioridad, ruta, motivo });

  if (d.etapa === "informarse") return r("baja", "Por ahora solo quiere informarse");
  if (d.area === "otro") return r("media", "No sabe qué área corresponde: requiere revisión de una persona");

  const subcategorias = subcategoriasValidas(d.area, d.publico);
  const asuntoDefinido = subcategorias.length === 0 || (d.subcategoria !== "" && d.subcategoria !== "otro");
  if (!asuntoDefinido) return r("media", "Tipo de asunto sin definir");
  if (d.pago === "conversar") return r("media", "Quiere conversar la forma de pago");

  if (d.etapa === "fecha-limite") return r("alta", "Puede pagar y tiene una fecha límite o audiencia próxima");
  if (d.urgencia === "inmediata" || d.urgencia === "este-mes") return r("alta", "Puede pagar, necesidad definida y quiere avanzar pronto");
  return r("media", "Puede pagar; necesidad definida sin urgencia inmediata");
}
