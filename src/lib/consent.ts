"use client";

/**
 * Preferencias de cookies (cookie `lx_consent`, 180 días).
 * Las cookies necesarias no requieren consentimiento; funcionales, analítica y publicidad sí.
 */
export type Consent = { funcional: boolean; analitica: boolean; marketing: boolean; fecha: string; v: number };

export const CONSENT_COOKIE = "lx_consent";
const VERSION = 1;
const DIAS = 180;
const EVENTO = "lx:consent-change";
export const EVENTO_ABRIR_PREFERENCIAS = "lx:abrir-preferencias-cookies";

export function leerConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const fila = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!fila) return null;
  try {
    const data = JSON.parse(decodeURIComponent(fila.split("=").slice(1).join("="))) as Consent;
    return data.v === VERSION ? data : null;
  } catch {
    return null;
  }
}

export function guardarConsent(funcional: boolean, analitica: boolean, marketing: boolean): Consent {
  const consent: Consent = { funcional, analitica, marketing, fecha: new Date().toISOString(), v: VERSION };
  const seguro = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${DIAS * 86400}; Path=/; SameSite=Lax${seguro}`;
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: consent }));
  return consent;
}

export function onConsentChange(cb: (c: Consent) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<Consent>).detail);
  window.addEventListener(EVENTO, handler);
  return () => window.removeEventListener(EVENTO, handler);
}

export function abrirPreferenciasCookies() {
  window.dispatchEvent(new Event(EVENTO_ABRIR_PREFERENCIAS));
}
