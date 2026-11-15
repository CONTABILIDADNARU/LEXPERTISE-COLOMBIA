import { AREAS, type Publico } from "@/lib/areas";
import { getServiciosVisibles } from "@/lib/content";
import { agendaReserva, consentimientos, enlaceWhatsApp, sitio, type WhatsAppContexto } from "@/lib/settings";
import { ContactChannels } from "./ContactChannels";
import { LeadForm, type AreaOpcion } from "./LeadForm";
import { Eyebrow, Section } from "./ui";

/** Áreas ofrecidas en el formulario: solo las que tienen página de área visible. */
export function areasDisponibles(): AreaOpcion[] {
  const visibles = new Set(getServiciosVisibles().filter((s) => s.tipo === "area").map((s) => s.area));
  return AREAS.filter((a) => visibles.has(a.key)).map(({ key, nombre, publicos, subcategorias }) => ({ key, nombre, publicos, subcategorias }));
}

export function LeadFormServer({
  tipo = "contacto",
  preset,
  titulo,
  descripcion,
  contexto = "general",
  className,
}: {
  tipo?: "contacto" | "agendamiento";
  preset?: { publico?: Publico; area?: string; subcategoria?: string };
  titulo?: string;
  descripcion?: string;
  contexto?: WhatsAppContexto;
  className?: string;
}) {
  return (
    <LeadForm
      tipo={tipo}
      areas={areasDisponibles()}
      preset={preset}
      consent={consentimientos}
      comoNosConocio={sitio.comoNosConocio}
      whatsappHref={enlaceWhatsApp(contexto)}
      conAgenda={agendaReserva() !== null}
      titulo={titulo}
      descripcion={descripcion}
      className={className}
    />
  );
}

export const DESCRIPCION_FORMULARIO = "Responde unas preguntas breves (1 minuto). No incluyas detalles íntimos ni documentos.";

/** Cómo funciona: todo pasa por el formulario y, según el caso, se agenda o se continúa por WhatsApp. */
function pasosAgenda(): string[] {
  const agenda = agendaReserva() !== null;
  const whatsapp = enlaceWhatsApp() !== null;
  const segundo = agenda
    ? `Según tu caso, eliges el día y la hora de tu consulta${whatsapp ? " o nos escribes tu pregunta por WhatsApp" : ""}.`
    : `Según tu caso, te contactamos para acordar la consulta${whatsapp ? " o nos escribes tu pregunta por WhatsApp" : ""}.`;
  return [
    "Respondes unas preguntas breves sobre tu asunto.",
    segundo,
    "Te informamos el alcance y los honorarios antes de cualquier contratación.",
  ];
}

/** Bloque de cierre de alto contraste con canales y formulario compacto. */
export function ContactCTA({
  titulo,
  texto,
  preset,
  contexto = "general",
  id = "solicitud",
  conFormulario = true,
}: {
  titulo: string;
  texto: string;
  preset?: { publico?: Publico; area?: string; subcategoria?: string };
  contexto?: WhatsAppContexto;
  id?: string;
  conFormulario?: boolean;
}) {
  return (
    <Section tono="dark" id={id} labelledBy={`${id}-titulo`}>
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <Eyebrow dark>Contacto</Eyebrow>
          <h2 id={`${id}-titulo`} className="mt-4 text-3xl text-ivory sm:text-4xl lg:text-[2.75rem]">
            {titulo}
          </h2>
          <p className="mt-4 max-w-md text-ivory/75">{texto}</p>
          <ol className="mt-8 max-w-md space-y-3 text-[0.95rem] text-ivory/80">
            {pasosAgenda().map((p, i) => (
              <li key={p} className="flex gap-3">
                <span className="font-serif text-bronze">{String(i + 1).padStart(2, "0")}</span>
                {p}
              </li>
            ))}
          </ol>
          <div className="mt-10 border-t border-ivory/10 pt-8">
            <ContactChannels dark contexto={contexto} />
          </div>
        </div>
        {conFormulario && <LeadFormServer preset={preset} contexto={contexto} titulo="Agenda tu consulta" descripcion={DESCRIPCION_FORMULARIO} />}
      </div>
    </Section>
  );
}
