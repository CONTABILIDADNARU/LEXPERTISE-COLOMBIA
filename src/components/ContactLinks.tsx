"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { track } from "@/lib/analytics";
import { IS_PRODUCTION } from "@/lib/env";
import { buttonClasses, cx } from "./ui";

type Variante = "primary" | "secondary" | "brand" | "ghost-dark";

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
        <span className="rounded-sm bg-pending px-1 text-[0.65rem] font-bold uppercase text-ink-950">Pendiente</span>
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
 * Enlace «Agendar consulta». Si la página ya tiene el formulario (#solicitud), baja hasta él y enfoca
 * el paso actual: así el botón siempre responde, también en /agendar-consulta y aunque ya estés en el
 * formulario (un enlace a la misma página no haría nada). Si no hay formulario, abre /agendar-consulta.
 */
export function AgendarConsultaLink({
  className,
  children,
  onIrAlFormulario,
}: {
  className?: string;
  children: ReactNode;
  onIrAlFormulario?: () => void;
}) {
  return (
    <Link
      href="/agendar-consulta"
      className={className}
      onClick={(e) => {
        const formulario = document.getElementById("solicitud");
        if (!formulario || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onIrAlFormulario?.();
        const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        formulario.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
        formulario.querySelector<HTMLElement>("[data-titulo-paso]")?.focus({ preventScroll: true });
      }}
    >
      {children}
    </Link>
  );
}

/**
 * Barra fija en celulares con una sola acción: «Agendar consulta».
 * Si la página tiene formulario, baja hasta él (conserva el área de la página); si no, abre /agendar-consulta.
 * WhatsApp no aparece aquí: se ofrece después del formulario, con el resumen ya escrito.
 */
export function MobileContactBar() {
  const pathname = usePathname();
  if (pathname === "/gracias") return null;
  return (
    <nav
      aria-label="Acción principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
    >
      <AgendarConsultaLink className={buttonClasses("primary", "min-h-12 w-full")}>
        <CalendarCheck aria-hidden className="size-5" /> Agendar consulta
      </AgendarConsultaLink>
    </nav>
  );
}
