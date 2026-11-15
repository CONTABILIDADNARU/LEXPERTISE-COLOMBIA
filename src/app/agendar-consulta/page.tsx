import { CalendarDays, CircleHelp, Clock, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Pending } from "@/components/Pending";
import { DESCRIPCION_FORMULARIO, LeadFormServer } from "@/components/sections";
import { Section } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { agendaReserva, sitio } from "@/lib/settings";

export const metadata = buildMetadata({
  title: "Solicitar una consulta jurídica",
  description:
    "Solicita una consulta jurídica con LEXPERTISE: elige el área, tu modalidad preferida y fechas posibles. Te contactaremos para confirmar la cita.",
  path: "/agendar-consulta",
});

export default function AgendarPage() {
  const { consulta } = sitio;
  // Todo pasa por el formulario: la agenda en línea (si existe) se ofrece al terminar, en /gracias.
  const agenda = agendaReserva();
  return (
    <>
      <PageHero
        migas={[
          { nombre: "Inicio", href: "/" },
          { nombre: "Solicitar una consulta", href: "/agendar-consulta" },
        ]}
        eyebrow="Consulta jurídica"
        titulo="Agenda tu consulta jurídica."
        texto={
          agenda
            ? "Responde unas preguntas breves sobre tu asunto. Según tu caso, al terminar podrás elegir el día y la hora de tu consulta."
            : "Responde unas preguntas breves e indica algunas fechas posibles. Un integrante del equipo te contactará para confirmar disponibilidad, alcance y honorarios."
        }
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
                    <strong className="text-navy">Duración y valor.</strong>{" "}
                    {consulta.confirmada && consulta.duracion && consulta.precio ? (
                      <>
                        La consulta dura {consulta.duracion} y tiene un valor de {consulta.precio}. {consulta.condiciones}
                      </>
                    ) : (
                      <>
                        Se informan antes de confirmar la cita. <Pending campo="Precio, duración y condiciones de la consulta" />
                      </>
                    )}
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
                  <span>
                    <strong className="text-navy">Cambios o cancelación.</strong> Si necesitas reprogramar o cancelar, avísanos por el canal en el que te confirmemos la cita.
                    <Pending campo="Política de cancelación y reprogramación" className="ml-1" />
                  </span>
                </li>
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
              titulo="Agenda tu consulta"
              descripcion={agenda ? DESCRIPCION_FORMULARIO : `${DESCRIPCION_FORMULARIO} Las fechas se registran en hora de Colombia (GMT-5).`}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
