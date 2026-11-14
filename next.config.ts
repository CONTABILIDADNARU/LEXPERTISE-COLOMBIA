import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const siteEnv = process.env.NEXT_PUBLIC_SITE_ENV ?? "development";
const isProd = siteEnv === "production";
const isDev = process.env.NODE_ENV === "development";

// Content-Security-Policy del sitio público. Los dominios de terceros solo se usan si el
// visitante acepta cookies de medición o pulsa un video; aquí se permiten para que funcionen.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://connect.facebook.net https://assets.calendly.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://www.facebook.com",
  "font-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net",
  "frame-src https://www.youtube-nocookie.com https://www.instagram.com https://www.tiktok.com https://calendly.com https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

// El panel de contenidos (Decap CMS) se carga desde unpkg y habla con la API de GitHub.
const cspAdmin = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://unpkg.com",
  "img-src 'self' data: blob: https://*.githubusercontent.com https://github.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.github.com https://*.githubusercontent.com http://localhost:8081",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

type Redireccion = { origen: string; destino: string };
function leerRedirecciones(): Redireccion[] {
  try {
    const raw = readFileSync(join(process.cwd(), "content/settings/redirecciones.json"), "utf8");
    return (JSON.parse(raw).redirecciones ?? []) as Redireccion[];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // Permite compilar variantes (p. ej. una prueba de producción) sin pisar la compilación principal.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          { key: "Content-Security-Policy", value: csp },
          // Staging y desarrollo nunca se indexan.
          ...(isProd ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspAdmin },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
  async rewrites() {
    // Panel de contenidos estático en public/admin/index.html.
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
  async redirects() {
    return leerRedirecciones().map((r) => ({ source: r.origen, destination: r.destino, permanent: true }));
  },
};

export default nextConfig;
