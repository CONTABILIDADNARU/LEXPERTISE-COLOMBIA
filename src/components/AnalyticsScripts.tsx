"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { leerConsent, onConsentChange, type Consent } from "@/lib/consent";
import { capturarAtribucion, sincronizarAtribucion } from "@/lib/attribution";
import { ANALYTICS } from "@/lib/env";

/**
 * Carga las etiquetas de medición SOLO después del consentimiento:
 * - GTM (si hay ID) o GA4 directo (si no hay GTM). Modo de consentimiento v2 con todo denegado por defecto.
 * - Píxel de Meta solo con consentimiento de publicidad.
 * También captura la atribución de campaña (en memoria; en el navegador solo con consentimiento «Funcionales»).
 */
function cargarScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function asegurarGtag() {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

function aplicarConsent(c: Consent) {
  const { gtmId, ga4Id, metaPixelId } = ANALYTICS;
  if ((gtmId || ga4Id) && (c.analitica || c.marketing)) {
    asegurarGtag();
    window.gtag!("consent", "update", {
      analytics_storage: c.analitica ? "granted" : "denied",
      ad_storage: c.marketing ? "granted" : "denied",
      ad_user_data: c.marketing ? "granted" : "denied",
      ad_personalization: c.marketing ? "granted" : "denied",
    });
    if (gtmId) {
      window.__lxGtm = true;
      window.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
      cargarScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`, "lx-gtm");
    } else if (ga4Id && c.analitica) {
      if (!document.getElementById("lx-ga4")) {
        window.gtag!("js", new Date());
        window.gtag!("config", ga4Id, { anonymize_ip: true });
      }
      cargarScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`, "lx-ga4");
    }
  } else if (window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }

  if (metaPixelId && c.marketing && !window.fbq) {
    type FbqStub = ((...args: unknown[]) => void) & { queue: unknown[]; loaded: boolean; version: string; push: unknown; callMethod?: (...a: unknown[]) => void };
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as FbqStub;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.push = fbq;
    window.fbq = fbq;
    cargarScript("https://connect.facebook.net/en_US/fbevents.js", "lx-meta");
    window.fbq("consent", "grant");
    window.fbq("init", metaPixelId);
    window.fbq("track", "PageView");
  } else if (window.fbq && !c.marketing) {
    window.fbq("consent", "revoke");
  }
}

export function AnalyticsScripts() {
  const pathname = usePathname();
  const primera = useRef(true);

  useEffect(() => {
    capturarAtribucion();
    const c = leerConsent();
    if (c) aplicarConsent(c);
    return onConsentChange((nuevo) => {
      sincronizarAtribucion(nuevo);
      aplicarConsent(nuevo);
    });
  }, []);

  // PageView de Meta en navegación interna (GA4 la registra con la medición mejorada del historial).
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    capturarAtribucion();
    if (leerConsent()?.marketing && window.fbq) window.fbq("track", "PageView");
  }, [pathname]);

  return null;
}
