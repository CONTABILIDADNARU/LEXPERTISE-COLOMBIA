import { z } from "zod";
import sitioJson from "@content/settings/sitio.json";
import whatsappJson from "@content/settings/whatsapp.json";
import inicioJson from "@content/settings/inicio.json";
import consentimientosJson from "@content/legal/consentimientos.json";

const str = z.preprocess((v) => (v == null ? "" : v), z.string());

const SitioSchema = z.object({
  marca: z.string().min(1),
  descripcion: z.string(),
  verificado: z.boolean(),
  empresa: z.object({
    razonSocial: str,
    nit: str,
    direccion: str,
    ciudad: str,
    correo: str,
    correoDatos: str,
    telefono: str,
    horario: str,
  }),
  cobertura: str,
  redes: z.object({ instagram: str, tiktok: str, facebook: str, linkedin: str, youtube: str }),
  consulta: z.object({
    confirmada: z.boolean(),
    precio: str,
    duracion: str,
    modalidades: z.array(z.string()),
    condiciones: str,
  }),
  agendamiento: z.object({ proveedor: z.enum(["solicitud", "calendly"]), calendlyUrl: str }),
  comoNosConocio: z.array(z.string()),
});

export const WHATSAPP_CONTEXTOS = ["general", "divorcios", "empresas", "familia", "laboral", "contratos", "agendar"] as const;
export type WhatsAppContexto = (typeof WHATSAPP_CONTEXTOS)[number];

const WhatsAppSchema = z.object({
  numero: str,
  mensajes: z.record(z.enum(WHATSAPP_CONTEXTOS), z.string().min(5)),
});

const Paso = z.object({ titulo: z.string(), texto: z.string() });
const InicioSchema = z.object({
  hero: z.object({ antetitulo: z.string(), titulo: z.string(), subtitulo: z.string(), ctaPrimario: z.string(), ctaSecundario: z.string() }),
  publico: z.object({
    titulo: z.string(),
    personas: z.object({ titulo: z.string(), texto: z.string(), cta: z.string() }),
    empresas: z.object({ titulo: z.string(), texto: z.string(), cta: z.string() }),
  }),
  areas: z.object({ titulo: z.string(), texto: z.string() }),
  proceso: z.object({ titulo: z.string(), texto: z.string(), pasos: z.array(Paso).length(4) }),
  destacados: z.object({
    titulo: z.string(),
    texto: z.string(),
    items: z.array(z.object({ titulo: z.string(), texto: z.string(), href: z.string().startsWith("/") })),
  }),
  recursos: z.object({ titulo: z.string(), texto: z.string() }),
  faq: z.object({
    titulo: z.string(),
    items: z.array(z.object({ pregunta: z.string(), respuesta: z.string(), pendiente: str })),
  }),
  contacto: z.object({ titulo: z.string(), texto: z.string() }),
});

const ConsentimientosSchema = z.object({
  version: z.string().min(3),
  tratamientoDatos: z.string().min(20),
  comunicacionesComerciales: z.string().min(10),
  avisoFormulario: z.string().min(10),
});

export const sitio = SitioSchema.parse(sitioJson);
export const whatsapp = WhatsAppSchema.parse(whatsappJson);
export const inicio = InicioSchema.parse(inicioJson);

/** Reemplaza variables {{marca}} en textos de consentimiento. */
const consentRaw = ConsentimientosSchema.parse(consentimientosJson);
const conMarca = (t: string) => t.replaceAll("{{marca}}", sitio.marca);
export const consentimientos = {
  version: consentRaw.version,
  tratamientoDatos: conMarca(consentRaw.tratamientoDatos),
  comunicacionesComerciales: conMarca(consentRaw.comunicacionesComerciales),
  avisoFormulario: conMarca(consentRaw.avisoFormulario),
};

export type Sitio = z.infer<typeof SitioSchema>;

/** Número de WhatsApp en formato internacional sin signos (p. ej. 573001234567), o "" si no está confirmado. */
export function numeroWhatsApp(): string {
  return whatsapp.numero.replace(/\D/g, "");
}

export function enlaceWhatsApp(contexto: WhatsAppContexto = "general"): string | null {
  const numero = numeroWhatsApp();
  if (numero.length < 10) return null;
  const mensaje = whatsapp.mensajes[contexto] ?? whatsapp.mensajes.general;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function enlaceTelefono(): string | null {
  const tel = sitio.empresa.telefono.replace(/[^\d+]/g, "");
  return tel.length >= 7 ? `tel:${tel}` : null;
}
