import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileText } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import {
  Breadcrumbs,
  DocumentChecklist,
  FAQAccordion,
  Fuentes,
  LegalDisclaimer,
  ProcessSteps,
  Prose,
  ReviewBanner,
  ServiceCard,
} from "@/components/blocks";
import { TrackView } from "@/components/client-utils";
import { ContactCTA, DESCRIPCION_FORMULARIO, LeadFormServer } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, Section, buttonClasses, cx } from "@/components/ui";
import { getArea, type Publico } from "@/lib/areas";
import { getServicio, getServicios, getServiciosVisibles, servicioVisible, type Servicio } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { buildMetadata, type Miga } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getServiciosVisibles().map((s) => ({ servicio: s.slug }));
}

type Props = { params: Promise<{ servicio: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { servicio } = await params;
  const s = getServicio(servicio);
  if (!s) return {};
  return buildMetadata({ title: s.seo.title, description: s.seo.description, path: `/${s.slug}` });
}

/** Subcategoría del formulario que corresponde a cada landing (preselección). */
const SUBCATEGORIA: Record<string, string> = {
  "divorcio-mutuo-acuerdo": "divorcio-mutuo-acuerdo",
  "divorcio-unilateral": "divorcio-unilateral",
  "divorcio-con-hijos-y-bienes": "divorcio-hijos-bienes",
  sucesiones: "sucesiones",
};

function presetDe(s: Servicio): { publico?: Publico; area?: string; subcategoria?: string } {
  const area = getArea(s.area);
  const unicoPublico = area && area.publicos.length === 1 ? area.publicos[0] : undefined;
  const publico: Publico | undefined =
    unicoPublico ?? (s.audiencia.length === 1 ? (s.audiencia[0] === "empresas" ? "empresa" : "persona") : undefined);
  return { publico, area: s.area, subcategoria: SUBCATEGORIA[s.slug] };
}

function migasDe(s: Servicio): Miga[] {
  const migas: Miga[] = [
    { nombre: "Inicio", href: "/" },
    { nombre: "Áreas de práctica", href: "/servicios" },
  ];
  if (s.tipo !== "area") {
    const area = getArea(s.area);
    const pagArea = area && getServicio(area.slug);
    if (pagArea && servicioVisible(pagArea)) migas.push({ nombre: pagArea.titulo, href: `/${pagArea.slug}` });
    if (s.tipo === "landing") {
      const divorcios = getServicio("divorcios");
      if (s.slug.startsWith("divorcio-") && divorcios && servicioVisible(divorcios)) migas.push({ nombre: divorcios.titulo, href: "/divorcios" });
    }
  }
  migas.push({ nombre: s.titulo, href: `/${s.slug}` });
  return migas;
}

export default async function ServicioPage({ params }: Props) {
  const { servicio } = await params;
  const s = getServicio(servicio);
  if (!s || !servicioVisible(s)) notFound();

  const html = await renderMarkdown(s.cuerpo);
  const relacionados = s.relacionados.map((slug) => getServicio(slug)).filter((r): r is Servicio => Boolean(r && servicioVisible(r)));
  // Subpáginas del área (p. ej. divorcios y sucesiones dentro de familia).
  const hijos =
    s.tipo === "area"
      ? getServicios().filter((x) => x.area === s.area && x.tipo === "servicio" && servicioVisible(x) && !s.relacionados.includes(x.slug))
      : [];
  const preset = presetDe(s);
  const esLanding = s.tipo === "landing";
  const area = getArea(s.area);

  return (
    <>
      <TrackView event="view_service" params={{ area: s.area, servicio: s.slug }} />
      <ReviewBanner estado={s.revision.estado} notas={s.notasRevision} />

      {/* Hero específico */}
      <section aria-labelledby="titulo-servicio" className="bg-ledger text-ivory">
        <Container
          className={
            esLanding
              ? "grid gap-6 py-6 sm:gap-10 sm:py-16 lg:grid-cols-[1fr_minmax(0,25rem)] lg:gap-x-10 lg:gap-y-0 lg:py-20 xl:grid-cols-[1fr_minmax(0,30rem)] xl:gap-x-14"
              : "py-14 sm:py-20"
          }
        >
          <div className={esLanding ? "lg:col-start-1 lg:row-start-1" : undefined}>
            {/* En celular las landings van directo al título y al formulario (tráfico de anuncios). */}
            <div className={esLanding ? "hidden sm:block" : undefined}>
              <Breadcrumbs migas={migasDe(s)} dark />
            </div>
            <div className={cx("mt-8 items-center gap-4", esLanding ? "hidden sm:flex" : "flex")}>
              <span className="inline-flex size-12 items-center justify-center border border-bronze/60 text-bronze">
                <AreaIcon slug={s.slug} area={s.area} className="size-6" />
              </span>
              <Eyebrow dark>{area?.nombre ?? "Servicios jurídicos"}</Eyebrow>
            </div>
            <h1 id="titulo-servicio" className={cx("max-w-3xl leading-[1.06] sm:text-5xl lg:text-[3.6rem]", esLanding ? "text-[2rem] sm:mt-6" : "mt-6 text-4xl")}>
              {s.h1}
            </h1>
            <p className={cx("max-w-2xl text-ivory/75", esLanding ? "mt-3 text-base sm:mt-6 sm:text-lg" : "mt-6 text-lg")}>{s.subtitulo}</p>
            {esLanding ? (
              <div className="mt-8 hidden lg:flex">
                <a href="#informacion" className={buttonClasses("ghost-dark", "whitespace-nowrap")}>
                  Leer la información
                </a>
              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#solicitud" className={buttonClasses("bronze")}>
                  Agendar consulta <ArrowRight aria-hidden className="size-4" />
                </a>
              </div>
            )}
          </div>
          {esLanding && (
            <div id="solicitud" className="scroll-mt-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <LeadFormServer preset={preset} contexto={s.whatsapp} titulo="Agenda tu consulta" descripcion={DESCRIPCION_FORMULARIO} />
            </div>
          )}
          {esLanding && (
            <ul className="grid gap-3 border-t border-ivory/10 pt-6 text-sm text-ivory/75 sm:grid-cols-3 lg:col-start-1 lg:row-start-2 lg:mt-10 lg:self-start">
              <li>Información general y verificable</li>
              <li>Revisión del caso antes de recomendar una vía</li>
              <li>Honorarios y alcance informados antes de contratar</li>
            </ul>
          )}
        </Container>
      </section>

      {/* Explicación y consideraciones */}
      <Section tono="ivory" id="informacion" className="scroll-mt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <div>
            <Prose html={html} />
            <Fuentes fuentes={s.fuentes} />
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line bg-paper p-6">
              <p className="eyebrow text-bronze-ink">¿Necesitas revisar tu caso?</p>
              <p className="mt-3 text-[0.95rem] text-slate">Cuéntanos el asunto de forma general y te informamos las alternativas de atención.</p>
              <div className="mt-5 grid gap-2">
                <a href="#solicitud" className={buttonClasses("primary", "min-h-11 text-sm")}>
                  Agendar consulta
                </a>
              </div>
            </div>
            {relacionados.length > 0 && (
              <nav aria-label="Temas relacionados" className="mt-6 border border-line bg-paper p-6">
                <p className="eyebrow text-bronze-ink">Relacionado</p>
                <ul className="mt-3 divide-y divide-line">
                  {relacionados.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/${r.slug}`} className="flex items-center justify-between gap-3 py-3 text-[0.95rem] font-medium text-navy hover:underline">
                        {r.titulo} <ArrowRight aria-hidden className="size-4 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      </Section>

      {/* Subpáginas del área */}
      {hijos.length > 0 && (
        <Section tono="paper">
          <h2 className="text-3xl text-navy sm:text-4xl">Servicios dentro de esta área</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hijos.map((h) => (
              <ServiceCard key={h.slug} servicio={h} />
            ))}
          </div>
        </Section>
      )}

      {/* Procedimiento general */}
      {s.pasos.length > 0 && (
        <Section tono={hijos.length ? "ivory" : "paper"} labelledBy="pasos-titulo">
          <Eyebrow>Cómo se aborda</Eyebrow>
          <h2 id="pasos-titulo" className="mt-4 text-3xl text-navy sm:text-4xl">
            {esLanding || s.tipo === "servicio" ? "Procedimiento general" : "Cómo trabajamos en esta área"}
          </h2>
          <div className="mt-10">
            <ProcessSteps pasos={s.pasos} nota="Los pasos son orientativos: pueden variar según el caso, la vía aplicable y las decisiones de las autoridades competentes." />
          </div>
        </Section>
      )}

      {/* Documentación */}
      {s.documentos.length > 0 && (
        <Section tono="ivory">
          <DocumentChecklist documentos={s.documentos} />
        </Section>
      )}

      {/* Preguntas frecuentes */}
      {s.faqs.length > 0 && (
        <Section tono="paper" labelledBy="faq-servicio">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow>Preguntas frecuentes</Eyebrow>
              <h2 id="faq-servicio" className="mt-4 text-3xl text-navy sm:text-4xl">
                Dudas habituales sobre {s.titulo.toLowerCase()}
              </h2>
              <LegalDisclaimer className="mt-8" />
            </div>
            <FAQAccordion items={s.faqs} idPrefix={`faq-${s.slug}`} />
          </div>
        </Section>
      )}

      {/* Cierre */}
      {esLanding ? (
        <Section tono="dark">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl text-ivory sm:text-4xl">¿Quieres que revisemos tu situación?</h2>
              <p className="mt-3 text-ivory/75">
                Cada caso tiene particularidades. Responde unas preguntas breves y te explicaremos las alternativas de atención, el alcance y los honorarios antes de cualquier contratación.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#solicitud" className={buttonClasses("bronze")}>
                <FileText aria-hidden className="size-4" /> Agendar consulta
              </a>
            </div>
          </div>
        </Section>
      ) : (
        <ContactCTA
          titulo="¿Quieres que revisemos tu caso?"
          texto="Cuéntanos de forma general qué asunto necesitas revisar. Según tu situación, te mostraremos el siguiente paso."
          preset={preset}
          contexto={s.whatsapp}
        />
      )}

      {s.tipo !== "landing" && relacionados.length === 0 && (
        <Container className="py-6">
          <ButtonLink href="/servicios" variante="link">
            Ver todas las áreas de práctica
          </ButtonLink>
        </Container>
      )}
    </>
  );
}
