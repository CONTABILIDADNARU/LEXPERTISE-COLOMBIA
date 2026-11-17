import { Prose, ReviewBanner } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { Pending } from "@/components/Pending";
import { ContactCTA } from "@/components/sections";
import { Section } from "@/components/ui";
import { getPagina } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { buildMetadata } from "@/lib/seo";
import { sitio } from "@/lib/settings";

const pagina = getPagina("nosotros");

export const metadata = buildMetadata({ title: pagina.seo.title, description: pagina.seo.description, path: "/nosotros" });

export default async function NosotrosPage() {
  const html = await renderMarkdown(pagina.cuerpo);
  const e = sitio.empresa;
  const datos = [
    // La marca solo se lista si es distinta de la razón social.
    ...(sitio.marca !== e.razonSocial ? [{ etiqueta: "Marca", valor: sitio.marca, pendiente: "" }] : []),
    { etiqueta: "Razón social", valor: e.razonSocial, pendiente: "Razón social" },
    { etiqueta: "NIT", valor: e.nit, pendiente: "NIT" },
    { etiqueta: "Domicilio", valor: e.ciudad, pendiente: "Ciudad de domicilio" },
  ];
  return (
    <>
      <ReviewBanner estado={pagina.revision.estado} />
      <PageHero
        migas={[
          { nombre: "Inicio", href: "/" },
          { nombre: pagina.titulo, href: "/nosotros" },
        ]}
        eyebrow="La firma"
        titulo={pagina.h1}
        texto={pagina.subtitulo}
      />
      <Section tono="ivory">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <Prose html={html} />
          <aside className="self-start border border-line bg-paper p-6">
            <h2 className="eyebrow text-bronze-ink">Información institucional</h2>
            <dl className="mt-4 space-y-4 text-sm">
              {datos.map((d) => (
                <div key={d.etiqueta}>
                  <dt className="font-semibold text-navy">{d.etiqueta}</dt>
                  <dd className="mt-0.5 text-slate">{d.valor || <Pending campo={d.pendiente} />}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Section>
      <ContactCTA titulo="Conoce nuestros canales de atención jurídica." texto="Cuéntanos de forma general qué asunto necesitas revisar." />
    </>
  );
}
