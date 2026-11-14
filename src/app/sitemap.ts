import type { MetadataRoute } from "next";
import { equipoPublicable, getRecursosVisibles, getServiciosVisibles } from "@/lib/content";
import { IS_PRODUCTION, SITE_URL } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const hoy = new Date().toISOString().slice(0, 10);
  const recursos = getRecursosVisibles();
  const estaticas = [
    { ruta: "", prioridad: 1 },
    { ruta: "/personas", prioridad: 0.9 },
    { ruta: "/empresas", prioridad: 0.9 },
    { ruta: "/servicios", prioridad: 0.8 },
    { ruta: "/nosotros", prioridad: 0.6 },
    { ruta: "/contacto", prioridad: 0.7 },
    { ruta: "/agendar-consulta", prioridad: 0.7 },
    ...(!IS_PRODUCTION || equipoPublicable() ? [{ ruta: "/equipo", prioridad: 0.5 }] : []),
    ...(recursos.length ? [{ ruta: "/recursos", prioridad: 0.6 }] : []),
    { ruta: "/politica-de-privacidad", prioridad: 0.2 },
    { ruta: "/tratamiento-de-datos", prioridad: 0.2 },
    { ruta: "/politica-de-cookies", prioridad: 0.2 },
    { ruta: "/terminos-de-uso", prioridad: 0.2 },
  ];
  return [
    ...estaticas.map((e) => ({ url: `${SITE_URL}${e.ruta}`, lastModified: hoy, priority: e.prioridad })),
    ...getServiciosVisibles().map((s) => ({
      url: `${SITE_URL}/${s.slug}`,
      lastModified: s.actualizado || hoy,
      priority: s.tipo === "landing" ? 0.8 : 0.7,
    })),
    ...recursos.map((r) => ({ url: `${SITE_URL}/recursos/${r.slug}`, lastModified: r.actualizado || hoy, priority: 0.5 })),
  ];
}
