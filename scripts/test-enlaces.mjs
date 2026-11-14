#!/usr/bin/env node
/**
 * Rastrea el sitio desde la portada y verifica:
 * - que todo enlace interno responda 200 (o 30x hacia una página que responda 200),
 * - que cada página tenga exactamente un H1, <title>, meta description y canonical,
 * - que los títulos y descripciones no se repitan.
 *   BASE_URL=http://localhost:3100 node scripts/test-enlaces.mjs
 */
const BASE = (process.env.BASE_URL ?? "http://localhost:3100").replace(/\/$/, "");
const vistos = new Map();
const cola = ["/", "/sitemap.xml", "/robots.txt"];
const enlacesRotos = [];
const problemas = [];
const titulos = new Map();
const descripciones = new Map();

const extraer = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const decode = (s) => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'");

while (cola.length) {
  const ruta = cola.shift();
  if (vistos.has(ruta)) continue;
  const res = await fetch(BASE + ruta, { redirect: "manual" }).catch((e) => ({ status: 0, error: e.message }));
  vistos.set(ruta, res.status);
  if (res.status >= 300 && res.status < 400) {
    const destino = new URL(res.headers.get("location"), BASE);
    if (destino.origin === BASE) cola.push(destino.pathname);
    continue;
  }
  if (res.status !== 200) continue;
  const tipo = res.headers.get("content-type") ?? "";
  const cuerpo = await res.text();
  if (ruta === "/sitemap.xml") {
    for (const loc of extraer(cuerpo, /<loc>([^<]+)<\/loc>/g)) cola.push(new URL(loc).pathname);
    continue;
  }
  if (!tipo.includes("text/html")) continue;

  const h1 = (cuerpo.match(/<h1[\s>]/g) ?? []).length;
  const title = decode(cuerpo.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  const desc = decode(cuerpo.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const canonical = cuerpo.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? "";
  if (h1 !== 1) problemas.push(`${ruta}: ${h1} elementos H1 (debe haber 1)`);
  if (!title) problemas.push(`${ruta}: sin <title>`);
  if (!desc) problemas.push(`${ruta}: sin meta description`);
  if (!canonical && !ruta.startsWith("/gracias")) problemas.push(`${ruta}: sin canonical`);
  if (title) titulos.set(title, [...(titulos.get(title) ?? []), ruta]);
  if (desc) descripciones.set(desc, [...(descripciones.get(desc) ?? []), ruta]);

  for (const href of extraer(cuerpo, /href="([^"]+)"/g)) {
    if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/_next") || href.startsWith("/admin")) continue;
    const limpio = decode(href).split("#")[0].split("?")[0] || "/";
    if (/\.(css|js|png|jpg|svg|ico|woff2?|webp|avif|xml|txt)$/.test(limpio) && limpio !== "/sitemap.xml") continue;
    if (!vistos.has(limpio)) cola.push(limpio);
    if (!vistos.has(`ref:${limpio}`)) vistos.set(`ref:${limpio}`, ruta);
  }
}

for (const [ruta, estado] of vistos) {
  if (ruta.startsWith("ref:")) continue;
  if (estado !== 200 && !(estado >= 300 && estado < 400)) enlacesRotos.push(`${ruta} → ${estado} (enlazado desde ${vistos.get(`ref:${ruta}`) ?? "sitemap"})`);
}
for (const [t, rutas] of titulos) if (rutas.length > 1) problemas.push(`Título duplicado «${t}» en ${rutas.join(", ")}`);
for (const [d, rutas] of descripciones) if (rutas.length > 1) problemas.push(`Descripción duplicada en ${rutas.join(", ")}: «${d.slice(0, 60)}…»`);

const paginas = [...vistos.entries()].filter(([r, s]) => !r.startsWith("ref:") && s === 200).length;
console.log(`\nRastreo de ${BASE}: ${paginas} URL con respuesta 200.`);
console.log(enlacesRotos.length ? `\n✖ Enlaces rotos (${enlacesRotos.length}):\n  - ${enlacesRotos.join("\n  - ")}` : "✔ Sin enlaces internos rotos.");
console.log(problemas.length ? `\n✖ Problemas SEO/estructura (${problemas.length}):\n  - ${problemas.join("\n  - ")}` : "✔ Cada página tiene un H1, título, descripción y canonical únicos.");
process.exit(enlacesRotos.length || problemas.length ? 1 : 0);
