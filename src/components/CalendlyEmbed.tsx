"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { track } from "@/lib/analytics";
import { buttonClasses } from "./ui";

/**
 * Agenda de Calendly (solo si la firma la activa en content/settings/sitio.json).
 * Se carga cuando la persona lo pide, porque Calendly instala sus propias cookies.
 * La conversión `appointment_confirmed` se registra solo cuando Calendly confirma la reserva.
 */
export function CalendlyEmbed({ url }: { url: string }) {
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    if (!activo) return;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return;
      const data = e.data as { event?: string } | undefined;
      if (data?.event === "calendly.event_scheduled") track("appointment_confirmed", { formulario: "calendly" });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [activo]);

  if (!activo) {
    return (
      <div className="border border-line bg-paper p-8">
        <CalendarDays aria-hidden strokeWidth={1.4} className="size-8 text-brand-ink" />
        <h2 className="mt-5 text-2xl text-ink">Consulta los horarios disponibles</h2>
        <p className="mt-2 text-slate">La agenda la presta Calendly, un servicio externo que usa sus propias cookies.</p>
        <button type="button" onClick={() => setActivo(true)} className={`${buttonClasses("primary")} mt-6`}>
          Ver horarios disponibles
        </button>
      </div>
    );
  }
  const src = `${url}?embed_domain=${encodeURIComponent(window.location.host)}&embed_type=Inline&hide_gdpr_banner=1`;
  return <iframe src={src} title="Agenda de consultas" className="h-[720px] w-full border border-line bg-paper" loading="lazy" />;
}
