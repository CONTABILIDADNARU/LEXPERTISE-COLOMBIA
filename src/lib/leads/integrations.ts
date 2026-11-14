import { createHash, createHmac } from "node:crypto";
import type { EstadoCrm, SolicitudRegistro } from "./schema";

/**
 * Envío al CRM mediante webhook firmado (HMAC-SHA256). Compatible con el webhook de entrada del CRM
 * o con un orquestador (Make, Zapier, n8n). Las credenciales viven solo en el servidor.
 */
export async function enviarAlCrm(r: SolicitudRegistro): Promise<EstadoCrm> {
  const url = process.env.CRM_WEBHOOK_URL;
  const secreto = process.env.CRM_WEBHOOK_SECRET;
  if (!url || !secreto) return "no_configurado";
  const cuerpo = JSON.stringify({
    evento: "solicitud.creada",
    version: 1,
    solicitud: r,
    oportunidad: {
      pipeline: "Solicitudes web",
      etapa: "Solicitud recibida",
      titulo: `${r.tipo === "agendamiento" ? "Agendamiento" : "Solicitud"} · ${r.area} · ${r.publico}`,
      requiereRevisionHumana: r.requiereRevisionHumana,
    },
  });
  const ts = Math.floor(Date.now() / 1000).toString();
  const firma = createHmac("sha256", secreto).update(`${ts}.${cuerpo}`).digest("hex");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Lexpertise-Timestamp": ts,
        "X-Lexpertise-Signature": `sha256=${firma}`,
        "Idempotency-Key": r.idempotencyKey,
      },
      body: cuerpo,
      signal: AbortSignal.timeout(6000),
    });
    return res.ok ? "enviado" : "error";
  } catch {
    return "error";
  }
}

/**
 * API de Conversiones de Meta (opcional). Solo se envía si la persona aceptó cookies de publicidad.
 * Se usa el mismo event_id que el Píxel para deduplicar. No se envían correo, teléfono, nombre
 * ni el área jurídica: solo señales técnicas del navegador.
 */
export async function enviarConversionMeta(opts: {
  registro: SolicitudRegistro;
  sourceUrl: string;
  userAgent: string;
  ip: string;
  fbp?: string;
  fbc?: string;
}): Promise<void> {
  const pixel = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return;
  const evento = {
    event_name: opts.registro.tipo === "agendamiento" ? "Schedule" : "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.registro.id,
    action_source: "website",
    event_source_url: opts.sourceUrl,
    user_data: {
      client_user_agent: opts.userAgent.slice(0, 400),
      ...(opts.ip ? { client_ip_address: opts.ip } : {}),
      ...(opts.fbp ? { fbp: opts.fbp } : {}),
      ...(opts.fbc ? { fbc: opts.fbc } : {}),
    },
  };
  const body = {
    data: [evento],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
  };
  try {
    await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(pixel)}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // La conversión del servidor es complementaria; su fallo no afecta la solicitud.
  }
}

export function sha256(texto: string) {
  return createHash("sha256").update(texto).digest("hex");
}

/**
 * Límite de envíos por IP. En memoria por defecto (válido para un solo proceso).
 * En Vercel se recomienda Upstash Redis (UPSTASH_REDIS_REST_URL/TOKEN) para un límite global.
 */
const ventanas = new Map<string, number[]>();
export async function limiteExcedido(ip: string, max = 5, ventanaSeg = 600): Promise<boolean> {
  const clave = `lx:rl:${sha256(ip).slice(0, 24)}`;
  const upUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (upUrl && upToken) {
    try {
      const res = await fetch(`${upUrl}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${upToken}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["INCR", clave],
          ["EXPIRE", clave, String(ventanaSeg), "NX"],
        ]),
        signal: AbortSignal.timeout(2000),
      });
      const [incr] = (await res.json()) as { result: number }[];
      return incr.result > max;
    } catch {
      // Si Redis falla, se usa el límite en memoria.
    }
  }
  const ahora = Date.now();
  const lista = (ventanas.get(clave) ?? []).filter((t) => ahora - t < ventanaSeg * 1000);
  lista.push(ahora);
  ventanas.set(clave, lista);
  if (ventanas.size > 5000) ventanas.clear();
  return lista.length > max;
}
