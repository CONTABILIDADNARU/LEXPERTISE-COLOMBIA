"use client";

import { leerConsent } from "./consent";

/**
 * Eventos de medición. Reglas:
 * - Nunca se envían datos personales ni detalles del caso: solo parámetros de la lista blanca.
 * - Las conversiones (generate_lead, schedule_request) solo se disparan después de que el servidor
 *   confirma el registro, con event_id = referencia de la solicitud (deduplicación con la API de conversiones).
 * - A Meta no se envía el área jurídica: solo el tipo de evento.
 */
export type EventName =
  | "view_service"
  | "click_whatsapp"
  | "click_call"
  | "form_start"
  | "form_step"
  | "generate_lead"
  | "schedule_request"
  | "appointment_confirmed"
  | "open_calendar"
  | "open_assistant";

const PARAMS_PERMITIDOS = ["area", "publico", "formulario", "ubicacion", "contexto", "servicio", "pagina", "paso", "prioridad", "ruta", "pago"] as const;
type Param = (typeof PARAMS_PERMITIDOS)[number];
export type EventParams = Partial<Record<Param, string>>;

/** Mapeo a eventos estándar de Meta. Los no listados no se envían a Meta. */
const META: Partial<Record<EventName, string>> = {
  generate_lead: "Lead",
  schedule_request: "Schedule",
  appointment_confirmed: "Schedule",
  click_whatsapp: "Contact",
  click_call: "Contact",
  view_service: "ViewContent",
};

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: Fbq;
    __lxGtm?: boolean;
  }
}

function limpiar(params: EventParams): EventParams {
  const out: EventParams = {};
  for (const k of PARAMS_PERMITIDOS) {
    const v = params[k];
    if (typeof v === "string" && v.length <= 80) out[k] = v;
  }
  return out;
}

export function track(name: EventName, params: EventParams = {}, opts: { eventId?: string } = {}) {
  if (typeof window === "undefined") return;
  const clean = limpiar(params);
  const consent = leerConsent();

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...clean, ...(opts.eventId ? { event_id: opts.eventId } : {}) });

  // Con GTM, el contenedor decide los envíos a partir del dataLayer; sin GTM se usa gtag directamente.
  if (consent?.analitica && window.gtag && !window.__lxGtm) {
    window.gtag("event", name, clean);
  }
  const metaName = META[name];
  if (consent?.marketing && window.fbq && metaName) {
    window.fbq("track", metaName, {}, opts.eventId ? { eventID: opts.eventId } : undefined);
  }
  if (process.env.NEXT_PUBLIC_SITE_ENV !== "production") {
    console.info("[medición]", name, clean, opts.eventId ?? "");
  }
}
