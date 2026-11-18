"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, ExternalLink } from "lucide-react";
import { track } from "@/lib/analytics";
import { CLAVE_SIGUIENTE_PASO, type Ruta, type SiguientePaso as Resumen } from "@/lib/leads/opciones";
import type { AgendaReserva } from "@/lib/settings";
import { CalendlyEmbed } from "./CalendlyEmbed";
import { WhatsAppButton } from "./ContactLinks";
import { Pending } from "./Pending";
import { buttonClasses } from "./ui";

type Props = {
  ruta: Ruta;
  referencia: string | null;
  agenda: AgendaReserva | null;
  /** Número oficial en formato internacional sin signos, o null si no está confirmado. */
  numeroWhatsApp: string | null;
};

/**
 * Siguiente paso después del formulario, según la prioridad que calculó el servidor:
 * - agendar: agenda en línea (Google Calendar o Calendly); alternativa, WhatsApp.
 * - conversar: WhatsApp con el resumen ya escrito y «Mi pregunta es:»; alternativa, agenda.
 * - informar: recursos jurídicos; alternativa, WhatsApp.
 */
export function SiguientePaso({ ruta, referencia, agenda, numeroWhatsApp }: Props) {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [verAgenda, setVerAgenda] = useState(false);

  useEffect(() => {
    try {
      const guardado = JSON.parse(sessionStorage.getItem(CLAVE_SIGUIENTE_PASO) ?? "null") as Resumen | null;
      if (guardado && guardado.ref === referencia) setResumen(guardado);
    } catch {
      // Sin almacenamiento: el mensaje de WhatsApp sale sin resumen.
    }
  }, [referencia]);

  // La solicitud de cita viaja a WhatsApp con el resumen de la encuesta ya escrito (sin nombre, teléfono ni correo).
  const ref = referencia ? ` ${referencia}` : "";
  const mensaje = [
    ruta === "agendar"
      ? `Hola, quiero agendar una consulta jurídica. Mi solicitud es la${ref}, enviada desde la página web.`
      : `Hola, envié la solicitud${ref} desde la página web.`,
    resumen ? `Tema: ${resumen.tema}. Situación: ${[resumen.etapa, resumen.urgencia].filter(Boolean).join("; ")}.` : "",
    resumen?.modalidad ? `Modalidad preferida: ${resumen.modalidad}.` : "",
    resumen?.pago ? `Pago: ${resumen.pago}.` : "",
    "Acepté la Política de Cancelación y Reprogramación.",
    ruta === "agendar" ? "¿Qué fechas y horas tienen disponibles?" : "Mi pregunta es: ",
  ]
    .filter(Boolean)
    .join(" ");
  const whatsappHref = numeroWhatsApp ? `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}` : null;

  const whatsapp = (variante: "brand" | "ghost-dark", label: string) => (
    <WhatsAppButton href={whatsappHref} contexto="resumen" ubicacion={`gracias_${ruta}`} variante={variante} label={label} />
  );

  if (ruta === "agendar") {
    return (
      <Bloque
        titulo="Último paso: envía tu solicitud de cita por WhatsApp."
        texto="El mensaje ya lleva el resumen de tu encuesta. Te responderemos por WhatsApp para confirmar la fecha, la hora y el valor de la consulta."
      >
        <div className="flex flex-col gap-3 sm:flex-row">{whatsapp("brand", "Enviar mi solicitud por WhatsApp")}</div>
        {!whatsappHref && <p className="mt-3 text-sm text-ivory/65">Mientras tanto, te contactaremos al celular que dejaste para agendar.</p>}
        {agenda && (
          <div className="mt-8 border-t border-ivory/10 pt-6">
            <p className="mb-4 text-sm text-ivory/65">¿Quieres elegir ya el día y la hora? Aparta tu cita en la agenda y envíanos igual la solicitud por WhatsApp.</p>
            <Agenda agenda={agenda} ruta={ruta} />
          </div>
        )}
      </Bloque>
    );
  }

  if (ruta === "conversar") {
    return (
      <Bloque
        titulo="Último paso: escríbenos por WhatsApp."
        texto="El resumen de tu encuesta ya va escrito en el mensaje. Cuéntanos qué forma de pago necesitas o cuál es tu pregunta y te responderemos por ahí."
      >
        <div className="flex flex-col gap-3 sm:flex-row">{whatsapp("brand", "Escribir mi pregunta por WhatsApp")}</div>
        {!whatsappHref && <p className="mt-3 text-sm text-ivory/65">Mientras tanto, te contactaremos al celular que dejaste.</p>}
        {agenda && (
          <div className="mt-8 border-t border-ivory/10 pt-6">
            {verAgenda ? (
              <Agenda agenda={agenda} ruta={ruta} />
            ) : (
              <button type="button" onClick={() => setVerAgenda(true)} className={buttonClasses("ghost-dark")}>
                <CalendarDays aria-hidden className="size-4" /> Prefiero agendar directamente
              </button>
            )}
          </div>
        )}
      </Bloque>
    );
  }

  return (
    <Bloque
      titulo="Mientras revisamos tu solicitud"
      texto="Te dejamos información general que puede servirte. Si podemos ayudarte con tu asunto, te contactaremos por el medio que elegiste."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/recursos" className={buttonClasses("brand")}>
          Ver recursos jurídicos <ArrowRight aria-hidden className="size-4" />
        </Link>
        {whatsapp("ghost-dark", "Tengo una pregunta puntual")}
      </div>
    </Bloque>
  );
}

function Bloque({ titulo, texto, children }: { titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby="siguiente-paso" className="mt-10 border border-ivory/15 bg-ink-800/60 p-6 sm:p-8">
      <h2 id="siguiente-paso" className="text-2xl text-ivory sm:text-3xl">
        {titulo}
      </h2>
      <p className="mt-3 text-ivory/75">{texto}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Agenda en línea. Se carga solo cuando la persona la pide, porque el proveedor usa sus propias cookies. */
function Agenda({ agenda, ruta }: { agenda: AgendaReserva | null; ruta: Ruta }) {
  const [abierta, setAbierta] = useState(false);

  if (!agenda) {
    return (
      <div className="space-y-3 text-ivory/80">
        <p>Te contactaremos por el medio que elegiste para acordar la fecha y la hora.</p>
        <Pending campo="Agenda de citas de Google Calendar (enlace)" oscuro />
      </div>
    );
  }

  if (agenda.proveedor === "calendly") return <CalendlyEmbed url={agenda.url} />;

  if (!agenda.incrustable) {
    return (
      <a
        href={agenda.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("open_calendar", { ubicacion: "gracias", ruta })}
        className={buttonClasses("brand")}
      >
        <CalendarDays aria-hidden className="size-4" /> Abrir la agenda <ExternalLink aria-hidden className="size-4" />
      </a>
    );
  }

  if (!abierta) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setAbierta(true);
            track("open_calendar", { ubicacion: "gracias", ruta });
          }}
          className={buttonClasses("brand")}
        >
          <CalendarDays aria-hidden className="size-4" /> Ver horarios disponibles
        </button>
        <p className="mt-3 text-sm text-ivory/60">La agenda la presta Google Calendar, un servicio externo que usa sus propias cookies.</p>
      </div>
    );
  }

  return <iframe src={agenda.url} title="Agenda de consultas de LEXPERTISE COLOMBIA S.A.S" className="h-[680px] w-full border-0 bg-white" loading="lazy" />;
}
