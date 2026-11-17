import { AREAS, type Publico } from "@/lib/areas";
import { getServiciosVisibles } from "@/lib/content";
import { agendaReserva, consentimientos, enlaceFundacion, enlaceWhatsApp, precioConsulta, sitio, type WhatsAppContexto } from "@/lib/settings";
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
      precioConsulta={precioConsulta()}
      fundacionUrl={enlaceFundacion()}
      titulo={titulo}
      descripcion={descripcion}
      className={className}
    />
  );
}

export const TITULO_FORMULARIO = "Encuesta de participación";
export const DESCRIPCION_FORMULARIO = "Responde 4 preguntas breves (1 minuto) para agendar tu consulta. No incluyas detalles íntimos ni documentos.";

/** Cómo funciona: todo pasa por el formulario y, según el caso, se agenda o se continúa por WhatsApp. */
function pasosAgenda(): string[] {
  const precio = precioConsulta();
  const whatsapp = enlaceWhatsApp() !== null;
  const pasos = [
    "Respondes una encuesta breve sobre tu asunto.",
    `${precio ? `Si continúas con la consulta (${precio}), ` : "Si continúas con la consulta, "}${
      whatsapp ? "envías tu solicitud por WhatsApp y te confirmamos la fecha, la hora y el pago." : "te contactamos para confirmar la fecha, la hora y el pago."
    }`,
  ];
  if (enlaceFundacion()) pasos.push("Si en este momento no puedes pagarla, te indicamos una fundación que puede orientarte.");
  return pasos;
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
        {conFormulario && <LeadFormServer preset={preset} contexto={contexto} titulo={TITULO_FORMULARIO} descripcion={DESCRIPCION_FORMULARIO} />}
      </div>
    </Section>
  );
}
