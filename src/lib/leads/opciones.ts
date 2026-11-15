/**
 * Opciones de las preguntas de filtro del formulario. Las comparten el navegador (etiquetas)
 * y el servidor (validación y prioridad). `resumen` es el texto que va en el mensaje de WhatsApp.
 */

export const ETAPAS = [
  { valor: "sin-iniciar", etiqueta: "Aún no he iniciado nada", resumen: "aún no he iniciado nada" },
  { valor: "en-curso", etiqueta: "Ya hay un proceso o trámite en curso", resumen: "ya hay un proceso o trámite en curso" },
  { valor: "fecha-limite", etiqueta: "Tengo una fecha límite o una audiencia próxima", resumen: "tengo una fecha límite o una audiencia próxima" },
  { valor: "informarse", etiqueta: "Solo quiero informarme por ahora", resumen: "por ahora solo quiero informarme" },
] as const;

export const URGENCIAS = [
  { valor: "inmediata", etiqueta: "Lo antes posible", resumen: "quiero avanzar lo antes posible" },
  { valor: "este-mes", etiqueta: "Este mes", resumen: "quiero avanzar este mes" },
  { valor: "proximos-meses", etiqueta: "En los próximos meses", resumen: "quiero avanzar en los próximos meses" },
  { valor: "no-se", etiqueta: "Aún no lo sé", resumen: "aún no sé cuándo avanzar" },
] as const;

export const MODALIDADES = [
  { valor: "virtual", etiqueta: "Virtual" },
  { valor: "presencial", etiqueta: "Presencial" },
  { valor: "telefonica", etiqueta: "Telefónica" },
  { valor: "sin-preferencia", etiqueta: "Sin preferencia" },
] as const;

export type Etapa = (typeof ETAPAS)[number]["valor"];
export type Urgencia = (typeof URGENCIAS)[number]["valor"];
export type Modalidad = (typeof MODALIDADES)[number]["valor"];

export const ETAPA_VALORES = ETAPAS.map((e) => e.valor) as [Etapa, ...Etapa[]];
export const URGENCIA_VALORES = URGENCIAS.map((u) => u.valor) as [Urgencia, ...Urgencia[]];
export const MODALIDAD_VALORES = MODALIDADES.map((m) => m.valor) as [Modalidad, ...Modalidad[]];

export type Prioridad = "alta" | "media" | "baja";
/** Siguiente paso que ve la persona al terminar: agenda, WhatsApp con su pregunta o recursos. */
export type Ruta = "agendar" | "conversar" | "informar";

/** Datos que el formulario deja en sessionStorage para armar el mensaje de WhatsApp en /gracias. */
export type SiguientePaso = { ref: string; tema: string; etapa: string; urgencia: string };
export const CLAVE_SIGUIENTE_PASO = "lx_siguiente_paso";
