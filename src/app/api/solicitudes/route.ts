import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/env";
import { consentimientos } from "@/lib/settings";
import { SolicitudSchema, type RespuestaApi, type SolicitudRegistro } from "@/lib/leads/schema";
import { getLeadStore } from "@/lib/leads/store";
import { clasificar } from "@/lib/leads/prioridad";
import { enviarAlCrm, enviarConversionMeta, limiteExcedido, sha256 } from "@/lib/leads/integrations";
import { hoyEnBogota } from "@/lib/leads/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 12_000;
const TIEMPO_MINIMO_MS = 3_000;

function responder(body: RespuestaApi, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function error(codigo: string, mensaje: string, status: number, campos?: Record<string, string>) {
  return responder({ ok: false, codigo, mensaje, ...(campos ? { campos } : {}) }, status);
}

/** Acepta solo envíos desde el propio sitio (protección CSRF básica). */
function origenPermitido(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const permitidos = new Set([new URL(SITE_URL).origin, req.nextUrl.origin]);
  return permitidos.has(origin);
}

function nuevoId(): string {
  const fecha = hoyEnBogota().replaceAll("-", "");
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  const sufijo = Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
  return `LX-${fecha}-${sufijo}`;
}

function canalDe(a: SolicitudRegistro["atribucion"]): string {
  const t = a?.ultimo;
  if (!t) return "directo";
  if (t.utm_source) return [t.utm_source, t.utm_medium].filter(Boolean).join(" / ");
  if (t.gclid) return "google / cpc";
  if (t.fbclid) return "meta / social";
  if (t.referrer) {
    try {
      return `${new URL(t.referrer).hostname} / referencia`;
    } catch {
      return "referencia";
    }
  }
  return "directo";
}

function leerCookie(req: NextRequest, nombre: string) {
  return req.cookies.get(nombre)?.value;
}

function marketingAceptado(req: NextRequest): boolean {
  try {
    const raw = leerCookie(req, "lx_consent");
    return raw ? Boolean(JSON.parse(decodeURIComponent(raw)).marketing) : false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!origenPermitido(req)) return error("ORIGEN", "Solicitud no permitida.", 403);
  if (!req.headers.get("content-type")?.includes("application/json")) return error("FORMATO", "Formato no admitido.", 415);

  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "local").trim();
  if (await limiteExcedido(ip)) {
    return error("LIMITE", "Recibimos varios envíos seguidos desde tu conexión. Espera unos minutos e inténtalo de nuevo.", 429);
  }

  const texto = await req.text();
  if (texto.length > MAX_BYTES) return error("TAMANO", "La solicitud es demasiado grande.", 413);

  let json: unknown;
  try {
    json = JSON.parse(texto);
  } catch {
    return error("FORMATO", "No pudimos leer la solicitud.", 400);
  }

  const parsed = SolicitudSchema.safeParse(json);
  if (!parsed.success) {
    const campos: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "general");
      campos[k] ??= issue.message;
    }
    return error("VALIDACION", "Revisa los campos marcados.", 422, campos);
  }
  const d = parsed.data;

  // Antispam: campo trampa lleno o envío imposible de tan rápido. No se registra y no se muestra éxito.
  if (d.website || Date.now() - d.t < TIEMPO_MINIMO_MS) {
    return error("RECHAZADA", "No pudimos procesar la solicitud. Inténtalo de nuevo en unos segundos.", 400);
  }

  if (d.versionConsentimiento !== consentimientos.version) {
    return error("CONSENTIMIENTO", "El texto de autorización se actualizó. Recarga la página y vuelve a enviar.", 409);
  }

  const clasificacion = clasificar(d);

  const store = getLeadStore();
  if (!store) {
    console.error("[solicitudes] Almacenamiento no configurado: la solicitud no se registró.");
    return error("NO_DISPONIBLE", "En este momento no podemos registrar solicitudes. Tus datos no se guardaron.", 503);
  }

  try {
    const ahora = new Date().toISOString();
    const registro: SolicitudRegistro = {
      id: nuevoId(),
      idempotencyKey: d.idempotencyKey,
      creadoEn: ahora,
      zonaHoraria: "America/Bogota",
      tipo: d.tipo,
      publico: d.publico,
      area: d.area,
      subcategoria: d.subcategoria,
      ciudad: d.ciudad,
      preferenciaContacto: d.preferenciaContacto,
      etapa: d.etapa,
      urgencia: d.urgencia,
      modalidad: d.modalidad,
      prioridad: clasificacion.prioridad,
      ruta: clasificacion.ruta,
      motivoPrioridad: clasificacion.motivo,
      nombre: d.nombre,
      telefono: d.telefono,
      correo: d.correo,
      empresa: d.publico === "empresa" ? d.empresa : "",
      comoNosConocio: d.comoNosConocio,
      // Fechas posibles: solo cuando no hay agenda en línea (con agenda, la persona elige la cita en /gracias).
      agendamiento:
        d.tipo === "agendamiento" && d.fechasPreferidas.length > 0
          ? { modalidad: d.modalidad, fechasPreferidas: [...d.fechasPreferidas].sort(), franja: d.franja ?? "indiferente" }
          : null,
      consentimiento: {
        datos: true,
        comercial: d.consentimientoComercial,
        version: consentimientos.version,
        textoSha256: sha256(`${consentimientos.tratamientoDatos}\n${d.consentimientoComercial ? consentimientos.comunicacionesComerciales : ""}`),
        aceptadoEn: ahora,
      },
      atribucion: d.atribucion,
      canal: canalDe(d.atribucion),
      paginaOrigen: d.paginaOrigen,
      estado: "solicitud_recibida",
      // Solicitudes fuera del portafolio: respuesta informativa tras revisión de una persona, nunca rechazo automático.
      requiereRevisionHumana: d.area === "otro" || d.subcategoria === "otro",
      responsable: "",
      crm: { estado: "pendiente", actualizadoEn: ahora },
    };

    // Doble clic o reintento: la base devuelve la referencia original y no se registra de nuevo.
    const resultado = await store.guardar(registro);
    const siguiente = { prioridad: clasificacion.prioridad, ruta: clasificacion.ruta };
    if (resultado.estado === "duplicada") return responder({ ok: true, id: resultado.id, ...siguiente, duplicada: true }, 200);

    // La solicitud ya está guardada. El CRM y Meta son complementarios: si fallan, quedan para reintento.
    const estadoCrm = await enviarAlCrm(registro);
    await store.actualizarCrm(registro.id, estadoCrm).catch(() => undefined);

    if (marketingAceptado(req)) {
      await enviarConversionMeta({
        registro,
        sourceUrl: `${SITE_URL}${d.paginaOrigen}`,
        userAgent: req.headers.get("user-agent") ?? "",
        ip: ip === "local" ? "" : ip,
        fbp: leerCookie(req, "_fbp"),
        fbc: leerCookie(req, "_fbc"),
      });
    }

    console.info(`[solicitudes] ${registro.id} registrada (${store.nombre}); CRM: ${estadoCrm}`);
    return responder({ ok: true, id: registro.id, ...siguiente }, 201);
  } catch (e) {
    // Sin datos personales en los registros del servidor.
    console.error("[solicitudes] Error al registrar:", e instanceof Error ? e.message : "desconocido");
    return error("ERROR_REGISTRO", "No pudimos registrar tu solicitud. Tus datos siguen en el formulario: inténtalo de nuevo.", 500);
  }
}

export function GET() {
  return error("METODO", "Método no permitido.", 405);
}
