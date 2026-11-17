import Link from "next/link";
import { CalendarDays, CircleHelp, Clock, MessageCircle, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Pending } from "@/components/Pending";
import { DESCRIPCION_FORMULARIO, TITULO_FORMULARIO, LeadFormServer } from "@/components/sections";
import { Section } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { agendaReserva, duracionConsulta, sitio } from "@/lib/settings";

export const metadata = buildMetadata({
  title: "Solicitar una consulta jurídica",
  description:
    "Agenda una consulta jurídica con LEXPERTISE COLOMBIA S.A.S: responde una encuesta breve y envía tu solicitud por WhatsApp para confirmar la cita.",
  path: "/agendar-consulta",
});

export default function AgendarPage() {
  const { consulta } = sitio;
  // Todo pasa por el formulario: la agenda en línea (si existe) se ofrece al terminar, en /gracias.
  const agenda = agendaReserva();
  const duracion = duracionConsulta();
  return (
    <>
      <PageHero
        migas={[
          { nombre: "Inicio", href: "/" },
          { nombre: "Solicitar una consulta", href: "/agendar-consulta" },
        ]}
        eyebrow="Consulta jurídica"
        titulo="Agenda tu consulta jurídica."
        texto="Responde una encuesta breve sobre tu asunto. Al terminar, envías tu solicitud por WhatsApp y te confirmamos la fecha, la hora y el valor de la consulta."
      />
      <Section tono="ivory">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <aside className="space-y-8">
            <div>
              <h2 className="text-3xl text-navy">Antes de solicitar</h2>
              <ul className="mt-6 space-y-5 text-[0.95rem]">
                <li className="flex gap-3">
                  <CalendarDays aria-hidden strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-bronze-ink" />
                  {agenda ? (
                    <span>
                      <strong className="text-navy">Primero, unas preguntas breves.</strong> Nos permiten preparar tu consulta. Al terminar, según tu caso, eliges la
                      fecha y la hora en la agenda o nos escribes tu pregunta.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-navy">Es una solicitud, no una cita confirmada.</strong> La fecha y la hora se acuerdan contigo después de revisar la
                      disponibilidad.
                    </span>
                  )}
                </li>
                <li className="flex gap-3">
                  <Clock aria-hidden strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-bronze-ink" />
                  <span>
                    <strong className="text-navy">Duración y valor.</strong> {duracion ? `La consulta dura ${duracion}. ` : ""}Su valor se informa antes de
                    confirmar la cita. {consulta.condiciones}
                  </span>
                </li>
                <li className="flex gap-3">
                  <ShieldCheck aria-hidden strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-bronze-ink" />
                  <span>
                    <strong className="text-navy">Sin documentos en esta etapa.</strong> Si son necesarios, te indicaremos cómo enviarlos por un canal adecuado.
                  </span>
                </li>
                <li className="flex gap-3">
                  <CircleHelp aria-hidden strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-bronze-ink" />
                  <div>
                    <strong className="text-navy">Cancelación y reprogramación.</strong> Al enviar tu solicitud aceptas nuestra política:
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-slate marker:text-bronze">
                      <li>Si cancelas con más de 48 horas hábiles de antelación, se reembolsa el 90 % del valor pagado (se retiene un 10 % por gastos administrativos, pasarelas de pago y gestión de agenda).</li>
                      <li>Hay una tolerancia de 15 minutos desde la hora programada, en sala física o virtual.</li>
                      <li>Si llegas o te conectas dentro de esos 15 minutos, la consulta dura el tiempo restante, sin extensión ni reducción de tarifa.</li>
                      <li>Pasados los 15 minutos sin presencia ni aviso previo, la cita se da por cancelada por inasistencia; se analiza la razón para evaluar reprogramación o reembolso.</li>
                    </ul>
                    <Link
                      href="/politica-de-cancelacion-y-reprogramacion"
                      className="mt-2 inline-block font-semibold text-navy underline decoration-bronze underline-offset-4"
                    >
                      Ver la política completa
                    </Link>
                  </div>
                </li>
                {sitio.empresa.horario && (
                  <li className="flex gap-3">
                    <MessageCircle aria-hidden strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-bronze-ink" />
                    <span>
                      <strong className="text-navy">Horario de recepción.</strong> {sitio.empresa.horario.replace(/\.$/, "")}. Las solicitudes enviadas fuera de este horario se
                      entienden recibidas a primera hora del día hábil siguiente.
                    </span>
                  </li>
                )}
              </ul>
            </div>
            {consulta.modalidades.length > 0 ? (
              <p className="text-sm text-slate">Modalidades disponibles: {consulta.modalidades.join(", ")}.</p>
            ) : (
              <Pending campo="Modalidades de atención disponibles" />
            )}
          </aside>
          <div id="solicitud" className="scroll-mt-24">
            <LeadFormServer
              tipo="agendamiento"
              contexto="agendar"
              titulo={TITULO_FORMULARIO}
              descripcion={agenda ? DESCRIPCION_FORMULARIO : `${DESCRIPCION_FORMULARIO} Las fechas se registran en hora de Colombia (GMT-5).`}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
