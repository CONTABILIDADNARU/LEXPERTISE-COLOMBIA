import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProcessSteps, ServiceCard } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { ContactCTA } from "@/components/sections";
import { buttonClasses, Section, SectionHeading } from "@/components/ui";
import { getServiciosVisibles } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { inicio } from "@/lib/settings";

export const metadata = buildMetadata({
  title: "Servicios jurídicos para personas",
  description:
    "Orientación jurídica para personas en asuntos de familia, divorcios, sucesiones, laborales, contratos y trámites ante entidades. Conoce cómo solicitar una consulta.",
  path: "/personas",
});

export default function PersonasPage() {
  const visibles = getServiciosVisibles().filter((s) => s.audiencia.includes("personas"));
  const areas = visibles.filter((s) => s.tipo === "area");
  const divorcio = visibles.filter((s) => s.slug.startsWith("divorcio"));
  const otros = visibles.filter((s) => s.tipo === "servicio" && !s.slug.startsWith("divorcio"));

  return (
    <>
      <PageHero
        migas={[
          { nombre: "Inicio", href: "/" },
          { nombre: "Personas", href: "/personas" },
        ]}
        eyebrow="Para personas"
        titulo="Orientación jurídica para decisiones personales y familiares."
        texto="Información y servicios en asuntos familiares, laborales, civiles y sucesorales. Antes de recomendar una alternativa, revisamos los hechos, los documentos y las fechas de tu caso."
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#solicitud" className={buttonClasses("bronze")}>
            Solicitar información <ArrowRight aria-hidden className="size-4" />
          </a>
          <Link href="/agendar-consulta" className={buttonClasses("ghost-dark")}>
            Solicitar una consulta
          </Link>
        </div>
      </PageHero>

      <Section tono="ivory" labelledBy="areas-personas">
        <SectionHeading id="areas-personas" eyebrow="Áreas" title="Asuntos en los que te podemos orientar" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((s) => (
            <ServiceCard key={s.slug} servicio={s} />
          ))}
        </div>
      </Section>

      {(divorcio.length > 0 || otros.length > 0) && (
        <Section tono="paper" labelledBy="familia-personas">
          <SectionHeading
            id="familia-personas"
            eyebrow="Familia"
            title="Divorcios y sucesiones"
            text="Información específica sobre las vías de divorcio, los acuerdos sobre hijos y bienes, y los trámites sucesorales."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...divorcio, ...otros].map((s) => (
              <ServiceCard key={s.slug} servicio={s} />
            ))}
          </div>
        </Section>
      )}

      <Section tono="dark" labelledBy="proceso-personas">
        <SectionHeading id="proceso-personas" eyebrow="Metodología" title={inicio.proceso.titulo} text={inicio.proceso.texto} dark />
        <div className="mt-12">
          <ProcessSteps pasos={inicio.proceso.pasos} dark />
        </div>
      </Section>

      <ContactCTA
        titulo="Cuéntanos qué necesitas revisar."
        texto="Indica de forma general el asunto. No es necesario enviar documentos ni detalles íntimos en esta etapa."
        preset={{ publico: "persona" }}
      />
    </>
  );
}
