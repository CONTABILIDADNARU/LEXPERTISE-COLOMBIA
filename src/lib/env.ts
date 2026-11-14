export type SiteEnv = "development" | "staging" | "production";

const raw = process.env.NEXT_PUBLIC_SITE_ENV;
export const SITE_ENV: SiteEnv = raw === "production" || raw === "staging" ? raw : "development";

/** Producción: el sitio público final. Staging/desarrollo: entorno de revisión, no indexable. */
export const IS_PRODUCTION = SITE_ENV === "production";

const urlVercel = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || urlVercel || "http://localhost:3000").replace(/\/$/, "");

export const ANALYTICS = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
};
