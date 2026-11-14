import type { MetadataRoute } from "next";
import { IS_PRODUCTION, SITE_URL } from "@/lib/env";

/** Staging y desarrollo bloquean todo rastreo; producción excluye API, panel y confirmación. */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/gracias"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
