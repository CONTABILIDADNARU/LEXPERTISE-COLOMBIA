"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, FileText } from "lucide-react";
import { track } from "@/lib/analytics";
import { IS_PRODUCTION } from "@/lib/env";
import { buttonClasses, cx } from "./ui";

type Variante = "primary" | "secondary" | "bronze" | "ghost-dark";

/**
 * Botón de WhatsApp con mensaje según la página. Si el número oficial no está configurado,
 * en revisión muestra un botón deshabilitado con aviso; en producción no se muestra.
 */
export function WhatsAppButton({
  href,
  contexto,
  ubicacion,
  variante = "secondary",
  label = "Escribir por WhatsApp",
  className,
}: {
  href: string | null;
  contexto: string;
  ubicacion: string;
  variante?: Variante;
  label?: string;
  className?: string;
}) {
  if (!href) {
    if (IS_PRODUCTION) return null;
    return (
      <span
        aria-disabled="true"
        title="Número oficial de WhatsApp pendiente de confirmar"
        className={cx(buttonClasses(variante, className), "cursor-not-allowed opacity-60")}
      >
        <MessageCircle aria-hidden className="size-4" /> {label}
        <span className="rounded-sm bg-pending px-1 text-[0.65rem] font-bold uppercase text-navy-950">Pendiente</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("click_whatsapp", { contexto, ubicacion })}
      className={buttonClasses(variante, className)}
    >
      <MessageCircle aria-hidden className="size-4" /> {label}
    </a>
  );
}

export function CallButton({
  href,
  ubicacion,
  variante = "secondary",
  label = "Llamar",
  className,
}: {
  href: string | null;
  ubicacion: string;
  variante?: Variante;
  label?: string;
  className?: string;
}) {
  if (!href) return null;
  return (
    <a href={href} onClick={() => track("click_call", { ubicacion })} className={buttonClasses(variante, className)}>
      <Phone aria-hidden className="size-4" /> {label}
    </a>
  );
}

/**
 * Barra de contacto fija en móviles: WhatsApp, llamada y solicitud.
 * El mensaje de WhatsApp cambia según la página (mapa ruta → contexto configurado en cada servicio).
 */
export function MobileContactBar({
  enlaces,
  rutas,
  telHref,
}: {
  enlaces: Record<string, string | null>;
  rutas: Record<string, string>;
  telHref: string | null;
}) {
  const pathname = usePathname();
  const contexto = rutas[pathname] ?? "general";
  const whatsappHref = enlaces[contexto] ?? enlaces.general ?? null;
  const item = "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[0.72rem] font-semibold";
  return (
    <nav
      aria-label="Contacto rápido"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("click_whatsapp", { contexto, ubicacion: "barra_movil" })}
          className={cx(item, "text-navy")}
        >
          <MessageCircle aria-hidden className="size-5" /> WhatsApp
        </a>
      ) : (
        !IS_PRODUCTION && (
          <span aria-disabled="true" className={cx(item, "text-slate/60")} title="Número de WhatsApp pendiente">
            <MessageCircle aria-hidden className="size-5" /> WhatsApp (pend.)
          </span>
        )
      )}
      {telHref && (
        <a href={telHref} onClick={() => track("click_call", { ubicacion: "barra_movil" })} className={cx(item, "border-l border-line text-navy")}>
          <Phone aria-hidden className="size-5" /> Llamar
        </a>
      )}
      <Link href="/contacto" className={cx(item, "border-l border-line bg-navy text-ivory")}>
        <FileText aria-hidden className="size-5" /> Solicitar información
      </Link>
    </nav>
  );
}
