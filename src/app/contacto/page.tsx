import { ContactChannels } from "@/components/ContactChannels";
import { CallButton, WhatsAppButton } from "@/components/ContactLinks";
import { PageHero } from "@/components/PageHero";
import { LeadFormServer } from "@/components/sections";
import { Section } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { enlaceTelefono, enlaceWhatsApp } from "@/lib/settings";

export const metadata = buildMetadata({
  title: "Contacto y canales de atención",
  description: "Solicita información a LEXPERTISE: formulario, WhatsApp y canales oficiales de atención. Cuéntanos tu asunto de forma general y te contactamos.",
  path: "/contacto",
});

export default function ContactoPage() {
  return (
    <>
      <PageHero
        migas={[
          { nombre: "Inicio", href: "/" },
          { nombre: "Contacto", href: "/contacto" },
        ]}
        eyebrow="Contacto"
        titulo="Conoce nuestros canales de atención jurídica."
        texto="Cuéntanos de forma general qué asunto necesitas revisar. Te contactaremos por el medio que prefieras para explicarte las alternativas de atención."
      />
      <Section tono="ivory">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <h2 className="text-3xl text-navy">Canales oficiales</h2>
            <p className="mt-3 text-slate">Usa solo los canales publicados en este sitio. No compartas documentos ni detalles íntimos por redes sociales.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsAppButton href={enlaceWhatsApp("general")} contexto="general" ubicacion="contacto" variante="primary" />
              <CallButton href={enlaceTelefono()} ubicacion="contacto" />
            </div>
            <div className="mt-10 border-t border-line pt-8">
              <ContactChannels />
            </div>
          </div>
          <div id="solicitud" className="scroll-mt-24">
            <LeadFormServer titulo="Formulario de solicitud" descripcion="Cuatro pasos breves. No necesitas enviar documentos." />
          </div>
        </div>
      </Section>
    </>
  );
}
