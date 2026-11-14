import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs, FAQAccordion, Fuentes, JsonLd, LegalDisclaimer, Prose, ReviewBanner, formatoFecha } from "@/components/blocks";
import { VideoEmbed } from "@/components/client-utils";
import { ContactCTA } from "@/components/sections";
import { Container, Eyebrow } from "@/components/ui";
import { getArea } from "@/lib/areas";
import { getRecurso, getRecursosVisibles, getServicio, recursoVisible, servicioVisible, type Servicio } from "@/lib/content";
import { SITE_URL } from "@/lib/env";
import { renderMarkdown } from "@/lib/markdown";
import { buildMetadata } from "@/lib/seo";
import { sitio } from "@/lib/settings";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRecursosVisibles().map((r) => ({ slug: r.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = getRecurso(slug);
  if (!r) return {};
  return buildMetadata({ title: r.seo.title, description: r.seo.description, path: `/recursos/${r.slug}`, type: "article" });
}

export default async function RecursoPage({ params }: Props) {
  const { slug } = await params;
  const r = getRecurso(slug);
  if (!r || !recursoVisible(r)) notFound();
  const html = await renderMarkdown(r.cuerpo);
  const area = getArea(r.categoria);
  const relacionados = r.relacionados.map((s) => getServicio(s)).filter((s): s is Servicio => Boolean(s && servicioVisible(s)));
  const fecha = r.actualizado || r.fechaPublicacion;

  const articuloJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: r.titulo,
    description: r.extracto,
    inLanguage: "es-CO",
    ...(r.fechaPublicacion ? { datePublished: r.fechaPublicacion } : {}),
    dateModified: fecha,
    mainEntityOfPage: `${SITE_URL}/recursos/${r.slug}`,
    author: r.autor ? { "@type": "Person", name: r.autor } : { "@type": "Organization", name: sitio.marca },
    publisher: { "@type": "Organization", name: sitio.marca },
  };

  return (
    <>
      <ReviewBanner estado={r.estado} notas={r.notasRevision} tipo="publicación" />
      <article>
        <header className="border-b border-line bg-paper">
          <Container className="py-12 sm:py-16">
            <div className="max-w-3xl">
              <Breadcrumbs
                migas={[
                  { nombre: "Inicio", href: "/" },
                  { nombre: "Recursos", href: "/recursos" },
                  { nombre: r.titulo, href: `/recursos/${r.slug}` },
                ]}
              />
              <Eyebrow className="mt-8">{area?.nombre ?? r.categoria}</Eyebrow>
              <h1 className="mt-5 text-4xl leading-[1.08] text-navy sm:text-5xl">{r.titulo}</h1>
              {r.preguntaPrincipal && <p className="mt-4 font-serif text-xl text-slate">«{r.preguntaPrincipal}»</p>}
              <p className="mt-5 text-lg text-slate">{r.extracto}</p>
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate">
                <div className="flex gap-2">
                  <dt>Actualizado:</dt>
                  <dd>
                    <time dateTime={fecha}>{formatoFecha(fecha)}</time>
                  </dd>
                </div>
                {r.fechaRevisionJuridica && (
                  <div className="flex gap-2">
                    <dt>Revisión jurídica:</dt>
                    <dd>
                      <time dateTime={r.fechaRevisionJuridica}>{formatoFecha(r.fechaRevisionJuridica)}</time>
                    </dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt>Autor:</dt>
                  <dd>{r.autor || `Equipo ${sitio.marca}`}</dd>
                </div>
              </dl>
            </div>
          </Container>
        </header>

        <Container className="py-12 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
            <div>
              {r.video && (
                <div className="mb-10">
                  <VideoEmbed plataforma={r.video.plataforma} url={r.video.url} titulo={r.preguntaPrincipal || r.titulo} />
                </div>
              )}
              <Prose html={html} />
              {r.faqs.length > 0 && (
                <div className="mt-12 max-w-[44rem]">
                  <h2 className="mb-4 text-3xl text-navy">Preguntas frecuentes</h2>
                  <FAQAccordion items={r.faqs} idPrefix={`faq-${r.slug}`} />
                </div>
              )}
              <LegalDisclaimer className="mt-10 max-w-[44rem]" />
              <Fuentes fuentes={r.fuentes} />
            </div>
            {relacionados.length > 0 && (
              <aside className="self-start border border-line bg-paper p-6 lg:sticky lg:top-24">
                <p className="eyebrow text-bronze-ink">Servicios relacionados</p>
                <ul className="mt-3 divide-y divide-line">
                  {relacionados.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/${s.slug}`} className="flex items-center justify-between gap-3 py-3 text-[0.95rem] font-medium text-navy hover:underline">
                        {s.titulo} <ArrowRight aria-hidden className="size-4 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </Container>
      </article>
      <JsonLd data={articuloJsonLd} />
      <ContactCTA
        titulo="¿Tienes una situación concreta?"
        texto="La información general no sustituye la revisión de tu caso. Cuéntanos el asunto y te explicaremos las alternativas de atención."
        preset={{ area: r.categoria, publico: area?.publicos.length === 1 ? area.publicos[0] : undefined }}
      />
    </>
  );
}
