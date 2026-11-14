"use client";

import { leerConsent, type Consent } from "./consent";

/**
 * Atribución de campañas (primer y último contacto): UTM, identificadores de clic, página de entrada
 * (sin parámetros) y el origen del sitio de referencia (solo dominio).
 *
 * - Siempre se conserva en memoria durante la visita, para poder adjuntarla a una solicitud que la
 *   persona envíe voluntariamente.
 * - Solo se guarda en el navegador (`lx_attr`, 90 días) si la persona acepta la categoría «Funcionales».
 *   Si la retira, se borra. Así lo describe la política de cookies.
 */
export const ATTR_KEY = "lx_attr";
const DIAS = 90;
const CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;

export type Toque = Partial<Record<(typeof CAMPOS)[number], string>> & {
  landing: string;
  referrer: string;
  fecha: string;
};
export type Atribucion = { primero: Toque; ultimo: Toque };

let memoria: Atribucion | null = null;

function cortar(v: string | null, max = 150): string | undefined {
  if (!v) return undefined;
  const limpio = v.replace(/[^\w\-.~:/% ]/g, "").slice(0, max);
  return limpio || undefined;
}

export function capturarAtribucion() {
  try {
    const url = new URL(window.location.href);
    const toque: Toque = { landing: url.pathname.slice(0, 200), referrer: "", fecha: new Date().toISOString() };
    let tieneCampana = false;
    for (const c of CAMPOS) {
      const v = cortar(url.searchParams.get(c));
      if (v) {
        toque[c] = v;
        tieneCampana = true;
      }
    }
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.host !== url.host) toque.referrer = ref.origin;
    }
    const actual = leerAtribucion();
    const externo = tieneCampana || Boolean(toque.referrer);
    if (!actual) memoria = { primero: toque, ultimo: toque };
    else if (externo) memoria = { primero: actual.primero, ultimo: toque };
    else memoria = actual;
    if (leerConsent()?.funcional) persistir(memoria);
  } catch {
    // Almacenamiento bloqueado o URL inválida: la atribución es opcional.
  }
}

/** Aplica la decisión de la persona: guarda la atribución si acepta «Funcionales»; la borra si no. */
export function sincronizarAtribucion(c: Consent) {
  try {
    if (c.funcional) {
      if (memoria) persistir(memoria);
    } else {
      localStorage.removeItem(ATTR_KEY);
    }
  } catch {
    // Sin acceso al almacenamiento.
  }
}

function persistir(a: Atribucion) {
  localStorage.setItem(ATTR_KEY, JSON.stringify({ ...a, expira: Date.now() + DIAS * 86400_000 }));
}

function leerPersistida(): Atribucion | null {
  try {
    if (!leerConsent()?.funcional) return null;
    const raw = localStorage.getItem(ATTR_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Atribucion & { expira: number };
    if (!data.expira || data.expira < Date.now()) {
      localStorage.removeItem(ATTR_KEY);
      return null;
    }
    return { primero: data.primero, ultimo: data.ultimo };
  } catch {
    return null;
  }
}

export function leerAtribucion(): Atribucion | null {
  return memoria ?? leerPersistida();
}
