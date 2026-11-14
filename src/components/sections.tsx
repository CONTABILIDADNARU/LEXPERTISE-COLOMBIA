import { AREAS, type Publico } from "@/lib/areas";
import { getServiciosVisibles } from "@/lib/content";
import { consentimientos, enlaceTelefono, enlaceWhatsApp, sitio, type WhatsAppContexto } from "@/lib/settings";
import { ContactChannels } from "./ContactChannels";
import { CallButton, WhatsAppButton } from "./ContactLinks";
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
      titulo={titulo}
      descripcion={descripcion}
      className={className}
    />
  );
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
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton href={enlaceWhatsApp(contexto)} contexto={contexto} ubicacion="cta_final" variante="bronze" />
            <CallButton href={enlaceTelefono()} ubicacion="cta_final" variante="ghost-dark" />
          </div>
          <div className="mt-10 border-t border-ivory/10 pt-8">
            <ContactChannels dark contexto={contexto} />
          </div>
        </div>
        {conFormulario && <LeadFormServer preset={preset} contexto={contexto} titulo="Solicitar información" descripcion="Toma menos de un minuto. No necesitas enviar documentos." />}
      </div>
    </Section>
  );
}
