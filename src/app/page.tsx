import Link from "next/link";
import { ArrowRight, Building2, Check, CircleHelp, User, X } from "lucide-react";
import { ArticleCard, FAQAccordion, ProcessSteps, ServiceCard } from "@/components/blocks";
import { ContactCTA } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { getAreasPrincipales, getRecursosVisibles, getServicio, servicioVisible } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { inicio } from "@/lib/settings";

export const metadata = buildMetadata({
  title: "LEXPERTISE COLOMBIA S.A.S · Servicios jurídicos para personas y empresas",
  description:
    "Servicios jurídicos en familia y sucesiones, laboral, civil y contratos, comercial, tributario, administrativo y marcas. Conoce las áreas y canales de atención.",
  path: "/",
  absoluto: true,
});

export default function InicioPage() {
  const areas = getAreasPrincipales();
  const recursos = getRecursosVisibles().slice(0, 3);
  // Los servicios destacados solo enlazan a páginas visibles.
  const destacados = inicio.destacados.items.filter((d) => {
    const slug = d.href.slice(1);
    const s = getServicio(slug);
    return !s || servicioVisible(s);
  });

  return (
    <>
      {/* 1 · Hero tipográfico */}
      <section aria-labelledby="hero-titulo" className="bg-ledger relative overflow-hidden text-ivory">
        <Container className="grid items-center gap-14 py-16 sm:py-20 lg:min-h-[calc(88dvh-4.5rem)] lg:grid-cols-[1.15fr_0.85fr] lg:py-14">
          <div>
            <Eyebrow dark>{inicio.hero.antetitulo}</Eyebrow>
            <h1 id="hero-titulo" className="mt-6 text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-[4.4rem]">
              {inicio.hero.titulo}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ivory/75 sm:text-xl">{inicio.hero.subtitulo}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/agendar-consulta" variante="brand" flecha>
                {inicio.hero.ctaPrimario}
              </ButtonLink>
              <ButtonLink href="/servicios" variante="ghost-dark">
                {inicio.hero.ctaSecundario}
              </ButtonLink>
            </div>
          </div>

          {/* «Lo que puedes esperar / Lo que no hacemos» (pedido de la firma: visible al inicio de la página). */}
          <div className="animate-rise-delay relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
            <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rotate-[2.5deg] border border-ivory/10 bg-ink-800" />
            <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 rotate-[1deg] border border-ivory/10 bg-ink-700/70" />
            <div className="relative bg-ivory p-7 text-graphite shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] sm:p-8">
              <h2 className="eyebrow text-brand-ink">{inicio.compromisos.titulo}</h2>
              <ul className="mt-4 space-y-3">
                {inicio.compromisos.esperar.map((t) => (
                  <li key={t} className="flex gap-3 text-[0.95rem] text-ink">
                    <Check aria-hidden strokeWidth={2} className="mt-1 size-4 shrink-0 text-brand-ink" />
                    {t}
                  </li>
                ))}
              </ul>
              <h2 className="eyebrow mt-6 border-t border-line pt-5 text-brand-ink">{inicio.compromisos.tituloNo}</h2>
              <ul className="mt-4 space-y-3">
                {inicio.compromisos.noHacemos.map((t) => (
                  <li key={t} className="flex gap-3 text-[0.95rem] text-slate">
                    <X aria-hidden strokeWidth={2} className="mt-1 size-4 shrink-0 text-slate" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* 2 · Identificación de público */}
      <Section tono="paper" labelledBy="publico-titulo">
        <SectionHeading id="publico-titulo" eyebrow="Orientación" title={inicio.publico.titulo} />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[
            { ...inicio.publico.personas, href: "/personas", Icon: User },
            { ...inicio.publico.empresas, href: "/empresas", Icon: Building2 },
          ].map(({ titulo, texto, cta, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col justify-between border border-line bg-ivory p-8 transition-colors hover:border-ink sm:p-10"
            >
              <div>
                <Icon aria-hidden strokeWidth={1.3} className="size-9 text-brand-ink" />
                <h3 className="mt-8 text-3xl text-ink sm:text-4xl">{titulo}</h3>
                <p className="mt-4 max-w-md text-slate">{texto}</p>
              </div>
              <span className="mt-10 inline-flex items-center gap-2 font-semibold text-ink">
                {cta} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* 3 · Áreas de práctica */}
      <Section tono="ivory" labelledBy="areas-titulo" id="areas">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading id="areas-titulo" eyebrow="Áreas de práctica" title={inicio.areas.titulo} text={inicio.areas.texto} />
          <ButtonLink href="/servicios" variante="secondary" flecha className="self-start lg:self-auto">
            Ver todos los servicios
          </ButtonLink>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {areas.map((a) => (
            <ServiceCard key={a.slug} servicio={a} />
          ))}
          <Link
            href="/agendar-consulta"
            className="group flex flex-col justify-between bg-ink p-6 text-ivory transition-colors hover:bg-ink-700 sm:p-7"
          >
            <CircleHelp aria-hidden strokeWidth={1.3} className="size-8 text-brand" />
            <div className="mt-8">
              <h3 className="text-2xl">¿No sabes qué área corresponde?</h3>
              <p className="mt-3 text-[0.95rem] text-ivory/70">Cuéntanos el asunto de forma general y te orientamos.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                Agendar consulta <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </Section>

      {/* 4 · Nuestra forma de trabajar */}
      <Section tono="dark" labelledBy="proceso-titulo">
        <SectionHeading id="proceso-titulo" eyebrow="Metodología" title={inicio.proceso.titulo} text={inicio.proceso.texto} dark />
        <div className="mt-12">
          <ProcessSteps pasos={inicio.proceso.pasos} dark nota="El desarrollo de cada etapa depende del asunto y de lo acordado con la firma. No se garantizan resultados ni plazos." />
        </div>
      </Section>

      {/* 5 · Servicios destacados */}
      <Section tono="paper" labelledBy="destacados-titulo">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading id="destacados-titulo" eyebrow="Servicios" title={inicio.destacados.titulo} text={inicio.destacados.texto} />
          <ul className="divide-y divide-line border-y border-line">
            {destacados.map((d) => (
              <li key={d.href}>
                <Link href={d.href} className="group grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
                  <div>
                    <h3 className="text-2xl text-ink transition-colors group-hover:text-ink-700">{d.titulo}</h3>
                    <p className="mt-1.5 text-[0.95rem] text-slate">{d.texto}</p>
                  </div>
                  <span className="inline-flex size-11 items-center justify-center border border-line text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
                    <ArrowRight aria-hidden className="size-4" />
                    <span className="sr-only">Ver {d.titulo}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 6 · Recursos jurídicos (solo si hay contenidos visibles) */}
      {recursos.length > 0 && (
        <Section tono="ivory" labelledBy="recursos-titulo">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading id="recursos-titulo" eyebrow="Recursos" title={inicio.recursos.titulo} text={inicio.recursos.texto} />
            <ButtonLink href="/recursos" variante="secondary" flecha className="self-start lg:self-auto">
              Ver todos los recursos
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {recursos.map((r) => (
              <ArticleCard key={r.slug} recurso={r} />
            ))}
          </div>
        </Section>
      )}

      {/* 7 · Preguntas frecuentes */}
      <Section tono="paper" labelledBy="faq-titulo">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading id="faq-titulo" eyebrow="Dudas frecuentes" title={inicio.faq.titulo} />
          <FAQAccordion items={inicio.faq.items} />
        </div>
      </Section>

      {/* 8 · Contacto final */}
      <ContactCTA titulo={inicio.contacto.titulo} texto={inicio.contacto.texto} />
    </>
  );
}
