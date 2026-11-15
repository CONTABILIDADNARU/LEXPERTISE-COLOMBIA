import { z } from "zod";
import { AREA_KEYS, getArea, subcategoriasValidas } from "../areas";
import { agendaReserva } from "../settings";
import { ETAPA_VALORES, MODALIDAD_VALORES, URGENCIA_VALORES, type Etapa, type Modalidad, type Prioridad, type Ruta, type Urgencia } from "./opciones";
import {
  hoyEnBogota,
  normalizarTelefono,
  validarCiudad,
  validarCorreo,
  validarFechaPreferida,
  validarNombre,
  validarTelefono,
} from "./validators";

const texto = (max: number) => z.string().trim().max(max);
const toque = z
  .object({
    utm_source: texto(150).optional(),
    utm_medium: texto(150).optional(),
    utm_campaign: texto(150).optional(),
    utm_content: texto(150).optional(),
    utm_term: texto(150).optional(),
    gclid: texto(200).optional(),
    fbclid: texto(300).optional(),
    landing: texto(200).default(""),
    referrer: texto(200).default(""),
    fecha: texto(40).default(""),
  })
  .strip();

const conMensaje = (fn: (v: string) => string | null) => (v: string, ctx: z.RefinementCtx) => {
  const err = fn(v);
  if (err) ctx.addIssue({ code: "custom", message: err });
};

export const SolicitudSchema = z
  .object({
    tipo: z.enum(["contacto", "agendamiento"]),
    publico: z.enum(["persona", "empresa"], { message: "Indica si consultas como persona o como empresa." }),
    area: z.enum([...AREA_KEYS, "otro"], { message: "Elige el área de tu consulta." }),
    subcategoria: texto(40).default(""),
    etapa: z.enum(ETAPA_VALORES, { message: "Indica en qué punto está tu asunto." }),
    urgencia: z.enum(URGENCIA_VALORES, { message: "Indica cuándo quieres avanzar." }),
    ciudad: z.string().superRefine(conMensaje(validarCiudad)).transform((v) => v.trim()),
    preferenciaContacto: z.enum(["whatsapp", "llamada", "correo"], { message: "Elige cómo prefieres que te contactemos." }),
    nombre: z.string().superRefine(conMensaje(validarNombre)).transform((v) => v.trim().replace(/\s+/g, " ")),
    telefono: z.string().superRefine(conMensaje(validarTelefono)).transform((v) => normalizarTelefono(v)!),
    correo: z.string().superRefine(conMensaje(validarCorreo)).transform((v) => v.trim().toLowerCase()),
    empresa: texto(120).default(""),
    comoNosConocio: texto(60).default(""),
    modalidad: z.enum(MODALIDAD_VALORES, { message: "Elige tu preferencia de modalidad." }),
    fechasPreferidas: z.array(z.string()).max(3).default([]),
    franja: z.enum(["manana", "tarde", "indiferente"]).optional(),
    consentimientoDatos: z.literal(true, { message: "Debes autorizar el tratamiento de datos para que podamos responder tu solicitud." }),
    consentimientoComercial: z.boolean().default(false),
    versionConsentimiento: texto(40),
    paginaOrigen: texto(200).refine((v) => v.startsWith("/"), "Página de origen inválida."),
    atribucion: z.object({ primero: toque, ultimo: toque }).nullable().default(null),
    idempotencyKey: z.uuid({ message: "Solicitud inválida." }),
    // Antispam: campo trampa (debe llegar vacío) y momento en que se abrió el formulario.
    website: z.string().max(200).default(""),
    t: z.number().int().positive(),
  })
  .superRefine((d, ctx) => {
    if (d.area !== "otro") {
      const area = getArea(d.area);
      if (!area?.publicos.includes(d.publico)) {
        ctx.addIssue({ code: "custom", path: ["area"], message: "Esa área no está disponible para este tipo de consulta." });
      }
      if (d.subcategoria && !subcategoriasValidas(d.area, d.publico).includes(d.subcategoria)) {
        ctx.addIssue({ code: "custom", path: ["subcategoria"], message: "Elige una opción de la lista." });
      }
    }
    // Con agenda en línea, la fecha se elige en la agenda: el formulario ya no pide fechas posibles.
    if (d.tipo === "agendamiento" && !agendaReserva()) {
      if (!d.franja) ctx.addIssue({ code: "custom", path: ["franja"], message: "Elige una franja horaria." });
      if (d.fechasPreferidas.length === 0) ctx.addIssue({ code: "custom", path: ["fechasPreferidas"], message: "Indica al menos una fecha posible." });
      const hoy = hoyEnBogota();
      d.fechasPreferidas.forEach((f) => {
        const err = validarFechaPreferida(f, hoy);
        if (err) ctx.addIssue({ code: "custom", path: ["fechasPreferidas"], message: err });
      });
      if (new Set(d.fechasPreferidas).size !== d.fechasPreferidas.length) {
        ctx.addIssue({ code: "custom", path: ["fechasPreferidas"], message: "Las fechas no deben repetirse." });
      }
    }
  });

export type SolicitudEntrada = z.input<typeof SolicitudSchema>;
export type SolicitudValida = z.output<typeof SolicitudSchema>;

export type EstadoCrm = "pendiente" | "enviado" | "no_configurado" | "error";

export type SolicitudRegistro = {
  id: string;
  idempotencyKey: string;
  creadoEn: string;
  zonaHoraria: "America/Bogota";
  tipo: SolicitudValida["tipo"];
  publico: SolicitudValida["publico"];
  area: SolicitudValida["area"];
  subcategoria: string;
  ciudad: string;
  preferenciaContacto: SolicitudValida["preferenciaContacto"];
  etapa: Etapa;
  urgencia: Urgencia;
  modalidad: Modalidad;
  /** Clasificación automática: ordena la atención y define el siguiente paso. Nunca descarta solicitudes. */
  prioridad: Prioridad;
  ruta: Ruta;
  motivoPrioridad: string;
  nombre: string;
  telefono: string;
  correo: string;
  empresa: string;
  comoNosConocio: string;
  agendamiento: { modalidad: string; fechasPreferidas: string[]; franja: string } | null;
  consentimiento: { datos: true; comercial: boolean; version: string; textoSha256: string; aceptadoEn: string };
  atribucion: SolicitudValida["atribucion"];
  canal: string;
  paginaOrigen: string;
  /** Etapa inicial del pipeline sugerido. */
  estado: "solicitud_recibida";
  requiereRevisionHumana: boolean;
  responsable: string;
  crm: { estado: EstadoCrm; actualizadoEn: string };
};

/** Respuesta estándar de la API. */
export type RespuestaApi =
  | { ok: true; id: string; prioridad: Prioridad; ruta: Ruta; duplicada?: boolean }
  | { ok: false; codigo: string; mensaje: string; campos?: Record<string, string> };
