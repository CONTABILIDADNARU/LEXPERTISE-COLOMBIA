import type { Metadata, Viewport } from "next";
import { Forum, Manrope } from "next/font/google";
import "./globals.css";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { Asistente } from "@/components/Asistente";
import { JsonLd, StagingBanner } from "@/components/blocks";
import { MobileContactBar } from "@/components/ContactLinks";
import { CookiePreferences } from "@/components/CookiePreferences";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { construirBaseAsistente } from "@/lib/asistente-base";
import { IS_PRODUCTION, SITE_URL } from "@/lib/env";
import { legalServiceJsonLd } from "@/lib/seo";
import { sitio } from "@/lib/settings";

const serif = Forum({ subsets: ["latin"], weight: "400", variable: "--font-forum", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${sitio.marca} · Servicios jurídicos en Colombia`, template: `%s | ${sitio.marca}` },
  description: sitio.descripcion,
  applicationName: sitio.marca,
  formatDetection: { telephone: false, email: false, address: false },
  robots: IS_PRODUCTION ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#4a4c4f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const asistente = construirBaseAsistente();
  return (
    <html lang="es-CO" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script
          // Evita que el aviso de cookies parpadee para quien ya decidió.
          dangerouslySetInnerHTML={{ __html: "try{if(document.cookie.indexOf('lx_consent=')>-1)document.documentElement.classList.add('lx-consent')}catch(e){}" }}
        />
      </head>
      <body className="flex min-h-dvh flex-col pb-16 lg:pb-0">
        <a
          href="#contenido"
          className="sr-only z-[60] bg-ink px-4 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Saltar al contenido
        </a>
        <StagingBanner />
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileContactBar />
        <Asistente base={asistente.base} enlaces={asistente.enlaces} />
        <CookiePreferences />
        <AnalyticsScripts />
        <JsonLd data={legalServiceJsonLd()} />
      </body>
    </html>
  );
}
