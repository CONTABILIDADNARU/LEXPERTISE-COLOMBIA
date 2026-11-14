import type { Metadata } from "next";
import { IS_PRODUCTION, SITE_URL } from "./env";
import { sitio } from "./settings";

type Opciones = {
  title: string;
  description: string;
  path: string;
  /** Fuerza noindex (p. ej. /gracias). Fuera de producción todo es noindex. */
  noindex?: boolean;
  type?: "website" | "article";
  /** Título completo sin la plantilla "| LEXPERTISE" (p. ej. la página de inicio). */
  absoluto?: boolean;
};

export function buildMetadata({ title, description, path, noindex, type = "website", absoluto }: Opciones): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const indexable = IS_PRODUCTION && !noindex;
  return {
    title: absoluto ? { absolute: title } : title,
    description,
    alternates: { canonical: url || SITE_URL },
    openGraph: {
      title,
      description,
      url: url || SITE_URL,
      siteName: sitio.marca,
      locale: "es_CO",
      type,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export type Miga = { nombre: string; href: string };

export function breadcrumbJsonLd(migas: Miga[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: migas.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.nombre,
      item: `${SITE_URL}${m.href === "/" ? "" : m.href}`,
    })),
  };
}

/**
 * Marcado LegalService: solo se emite cuando la firma marcó sus datos como verificados
 * (content/settings/sitio.json → "verificado": true) y existe información mínima.
 */
export function legalServiceJsonLd() {
  const e = sitio.empresa;
  if (!sitio.verificado || !e.razonSocial) return null;
  const redes = Object.values(sitio.redes).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: sitio.marca,
    legalName: e.razonSocial,
    url: SITE_URL,
    ...(e.telefono ? { telephone: e.telefono } : {}),
    ...(e.correo ? { email: e.correo } : {}),
    ...(e.nit ? { taxID: e.nit } : {}),
    ...(e.direccion
      ? { address: { "@type": "PostalAddress", streetAddress: e.direccion, addressLocality: e.ciudad, addressCountry: "CO" } }
      : {}),
    areaServed: { "@type": "Country", name: "Colombia" },
    ...(redes.length ? { sameAs: redes } : {}),
  };
}
