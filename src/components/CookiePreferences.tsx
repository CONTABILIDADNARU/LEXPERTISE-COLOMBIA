"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { abrirPreferenciasCookies, EVENTO_ABRIR_PREFERENCIAS, guardarConsent, leerConsent } from "@/lib/consent";
import { buttonClasses, cx } from "./ui";

/**
 * Banner y panel de preferencias de cookies. No hay casillas premarcadas: funcionales, analítica y publicidad
 * quedan desactivadas hasta que la persona las acepte. "Rechazar" tiene el mismo peso visual que "Aceptar".
 */
export function CookiePreferences() {
  // Se renderiza desde el servidor (visible) para que el aviso pinte sin esperar JavaScript.
  // Si ya hay consentimiento, un script en <head> lo oculta antes del primer pintado (clase lx-consent).
  const [visible, setVisible] = useState(true);
  const [reabierto, setReabierto] = useState(false);
  const [panel, setPanel] = useState(false);
  const [funcional, setFuncional] = useState(false);
  const [analitica, setAnalitica] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const titulo = useId();
  const dialogo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const actual = leerConsent();
    if (actual) {
      setVisible(false);
      setFuncional(actual.funcional);
      setAnalitica(actual.analitica);
      setMarketing(actual.marketing);
    } else if (document.documentElement.classList.contains("lx-consent")) {
      // Había una cookie de una versión anterior: se vuelve a pedir la decisión.
      setReabierto(true);
    }
    const abrir = () => {
      const c = leerConsent();
      setFuncional(c?.funcional ?? false);
      setAnalitica(c?.analitica ?? false);
      setMarketing(c?.marketing ?? false);
      setVisible(true);
      setReabierto(true);
      setPanel(true);
    };
    window.addEventListener(EVENTO_ABRIR_PREFERENCIAS, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_PREFERENCIAS, abrir);
  }, []);

  useEffect(() => {
    if (panel) dialogo.current?.querySelector<HTMLElement>("input,button")?.focus();
  }, [panel]);

  if (!visible) return null;

  const guardar = (f: boolean, a: boolean, m: boolean) => {
    guardarConsent(f, a, m);
    setVisible(false);
    setPanel(false);
  };

  return (
    <div
      ref={dialogo}
      data-cookie-banner=""
      data-reabierto={reabierto ? "" : undefined}
      role="dialog"
      aria-modal={panel ? "true" : undefined}
      aria-labelledby={titulo}
      className="fixed inset-x-3 bottom-[4.75rem] z-50 mx-auto max-h-[70dvh] max-w-xl overflow-y-auto rounded-[var(--radius-card)] border border-line bg-paper p-4 sm:p-5 text-graphite shadow-[0_20px_50px_-20px_rgb(12_22_36/0.45)] sm:inset-x-6 lg:bottom-6 lg:left-6 lg:right-auto"
    >
      <h2 id={titulo} className="font-sans text-base font-bold text-ink">
        Preferencias de cookies
      </h2>
      {!panel ? (
        <p className="mt-2 text-sm text-slate">
          Usamos cookies necesarias. Si lo autorizas, guardaremos el origen de tu visita y usaremos herramientas de Google y Meta,
          que pueden tratar datos para fines propios y fuera de Colombia. Puedes cambiarlo cuando quieras. Ver{" "}
          <Link href="/politica-de-cookies" className="underline decoration-brand underline-offset-4">
            política de cookies
          </Link>
          .
        </p>
      ) : (
        <fieldset className="mt-3 space-y-3 text-sm">
          <legend className="sr-only">Categorías de cookies</legend>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked disabled className="mt-1 size-4 accent-ink" />
            <span>
              <strong className="text-ink">Necesarias.</strong> Guardan tus preferencias y protegen los formularios. Siempre activas.
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={funcional} onChange={(e) => setFuncional(e.target.checked)} className="mt-1 size-4 accent-ink" />
            <span>
              <strong className="text-ink">Funcionales.</strong> Recordar el origen de tu visita (campaña o sitio de referencia) para
              asociarlo a una solicitud que envíes.
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={analitica} onChange={(e) => setAnalitica(e.target.checked)} className="mt-1 size-4 accent-ink" />
            <span>
              <strong className="text-ink">Analítica.</strong> Google Analytics: visitas y uso del sitio, de forma agregada.
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 size-4 accent-ink" />
            <span>
              <strong className="text-ink">Publicidad.</strong> Píxel de Meta: medir campañas en Facebook e Instagram.
            </span>
          </label>
        </fieldset>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {panel ? (
          <button type="button" onClick={() => guardar(funcional, analitica, marketing)} className={cx(buttonClasses("primary"), "col-span-2 min-h-10 py-2 text-sm")}>
            Guardar preferencias
          </button>
        ) : (
          <>
            <button type="button" onClick={() => guardar(true, true, true)} className={cx(buttonClasses("primary"), "min-h-10 py-2 text-sm")}>
              Aceptar todas
            </button>
            <button type="button" onClick={() => guardar(false, false, false)} className={cx(buttonClasses("primary"), "min-h-10 py-2 text-sm")}>
              Rechazar opcionales
            </button>
            <button type="button" onClick={() => setPanel(true)} className={cx(buttonClasses("secondary"), "col-span-2 min-h-10 py-2 text-sm")}>
              Configurar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={abrirPreferenciasCookies} className={className}>
      Preferencias de cookies
    </button>
  );
}
