import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, Info, ListChecks, TriangleAlert } from "lucide-react";
import type { Recurso, Servicio } from "@/lib/content";
import { getArea } from "@/lib/areas";
import { IS_PRODUCTION, SITE_ENV } from "@/lib/env";
import { breadcrumbJsonLd, type Miga } from "@/lib/seo";
import { sitio } from "@/lib/settings";
import { AreaIcon } from "./AreaIcon";
import { Container, cx } from "./ui";

export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function StagingBanner() {
  if (IS_PRODUCTION) return null;
  return (
    <div role="note" className="bg-pending px-4 py-1.5 text-center text-[0.75rem] font-semibold text-ink-950">
      Entorno de revisión ({SITE_ENV}) · no indexable · los textos marcados como «Pendiente» requieren confirmación de {sitio.marca}
    </div>
  );
}

export function Breadcrumbs({ migas, dark }: { migas: Miga[]; dark?: boolean }) {
  return (
    <>
      <nav aria-label="Ruta de navegación" className="text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {migas.map((m, i) => {
            const ultimo = i === migas.length - 1;
            return (
              <li key={m.href} className="flex items-center gap-2">
                {ultimo ? (
                  <span aria-current="page" className={dark ? "text-ivory/90" : "text-ink"}>
                    {m.nombre}
                  </span>
                ) : (
                  <>
                    <Link href={m.href} className={cx("underline-offset-4 hover:underline", dark ? "text-ivory/65" : "text-slate")}>
                      {m.nombre}
                    </Link>
                    <span aria-hidden className={dark ? "text-ivory/35" : "text-slate/50"}>
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(migas)} />
    </>
  );
}

/** Aviso de revisión jurídica pendiente (solo en el entorno de revisión). */
export function ReviewBanner({ estado, notas, tipo = "página" }: { estado: string; notas?: string[]; tipo?: string }) {
  if (IS_PRODUCTION || estado === "aprobado" || estado === "publicado") return null;
  return (
    <div className="border-b border-amber-300 bg-pending/70">
      <Container className="py-3 text-sm text-ink-950">
        <details>
          <summary className="flex cursor-pointer items-center gap-2 font-semibold">
            <TriangleAlert aria-hidden className="size-4 shrink-0" />
            Borrador: esta {tipo} está pendiente de revisión jurídica por un abogado de {sitio.marca}.
            {notas && notas.length > 0 && <span className="font-normal underline">Ver {notas.length} puntos a validar</span>}
          </summary>
          {notas && notas.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {notas.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
        </details>
      </Container>
    </div>
  );
}

export function LegalDisclaimer({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <aside
      className={cx(
        "flex gap-3 rounded-[var(--radius-card)] border p-4 text-sm",
        dark ? "border-ivory/15 text-ivory/75" : "border-line bg-paper text-slate",
        className,
      )}
    >
      <Info aria-hidden className={cx("mt-0.5 size-4 shrink-0", dark ? "text-brand" : "text-brand-ink")} />
      <p>
        Esta información es general y no reemplaza el análisis de un caso concreto. Las alternativas, los tiempos y la viabilidad
        dependen de los hechos, los documentos y las normas aplicables. No se garantizan resultados.
      </p>
    </aside>
  );
}

export function FAQAccordion({ items, idPrefix = "faq" }: { items: { pregunta: string; respuesta: string; pendiente?: string }[]; idPrefix?: string }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f, i) => (
        <details key={f.pregunta} className="group" id={`${idPrefix}-${i + 1}`}>
          <summary className="flex cursor-pointer items-start justify-between gap-6 py-5 text-left font-semibold text-ink transition-colors hover:text-ink-700 sm:text-lg">
            <span>{f.pregunta}</span>
            <ChevronDown aria-hidden className="mt-1 size-5 shrink-0 text-brand-ink transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="max-w-3xl pb-6 pr-8 text-slate">
            <p>{f.respuesta}</p>
            {f.pendiente && !IS_PRODUCTION && (
              <p className="mt-2">
                <mark className="rounded-sm bg-pending px-1.5 py-0.5 text-[0.7rem] font-bold uppercase text-ink-950">
                  Pendiente · {f.pendiente}
                </mark>
              </p>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

export function ProcessSteps({ pasos, dark, nota }: { pasos: { titulo: string; texto: string }[]; dark?: boolean; nota?: string }) {
  const cols = pasos.length >= 4 ? "lg:grid-cols-4" : pasos.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <>
      <ol className={cx("grid gap-px sm:grid-cols-2", cols, dark ? "bg-ivory/10" : "bg-line")}>
        {pasos.map((p, i) => (
          <li key={p.titulo} className={cx("flex flex-col p-6 sm:p-7", dark ? "bg-ink" : "bg-ivory")}>
            <span aria-hidden className={cx("font-serif text-4xl leading-none", dark ? "text-brand" : "text-brand-ink")}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className={cx("mt-6 font-sans text-lg font-bold tracking-normal", dark ? "text-ivory" : "text-ink")}>{p.titulo}</h3>
            <p className={cx("mt-2 text-[0.95rem]", dark ? "text-ivory/70" : "text-slate")}>{p.texto}</p>
          </li>
        ))}
      </ol>
      {nota && <p className={cx("mt-4 text-sm", dark ? "text-ivory/60" : "text-slate")}>{nota}</p>}
    </>
  );
}

export function ServiceCard({ servicio, compacta }: { servicio: Servicio; compacta?: boolean }) {
  const pendiente = !IS_PRODUCTION && servicio.estado !== "activo";
  return (
    <article className="group relative flex h-full flex-col border border-line bg-paper p-6 transition-[border-color,box-shadow] duration-200 hover:border-ink/40 hover:shadow-[var(--shadow-card)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex size-12 items-center justify-center border border-brand/60 text-ink">
          <AreaIcon slug={servicio.slug} area={servicio.area} className="size-6" />
        </span>
        {pendiente && <span className="rounded-sm bg-pending px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-ink-950">Por confirmar</span>}
      </div>
      <h3 className="mt-6 text-2xl text-ink">
        <Link href={`/${servicio.slug}`} className="after:absolute after:inset-0">
          {servicio.titulo}
        </Link>
      </h3>
      {!compacta && <p className="mt-3 flex-1 text-[0.95rem] text-slate">{servicio.resumen}</p>}
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink">
        Ver información
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </article>
  );
}

export function ArticleCard({ recurso }: { recurso: Recurso }) {
  const area = getArea(recurso.categoria);
  const fecha = recurso.actualizado || recurso.fechaPublicacion;
  return (
    <article className="group relative flex h-full flex-col border-t-2 border-ink bg-paper p-6 transition-shadow hover:shadow-[var(--shadow-card)]">
      <p className="eyebrow text-brand-ink">{area?.corto ?? recurso.categoria}</p>
      <h3 className="mt-4 text-[1.4rem] leading-snug text-ink">
        <Link href={`/recursos/${recurso.slug}`} className="after:absolute after:inset-0">
          {recurso.titulo}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-[0.95rem] text-slate">{recurso.extracto}</p>
      <div className="mt-6 flex items-center justify-between text-sm text-slate">
        <span>
          Actualizado: <time dateTime={fecha}>{formatoFecha(fecha)}</time>
        </span>
        <ArrowUpRight aria-hidden className="size-4 text-ink transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      {!IS_PRODUCTION && recurso.estado !== "publicado" && (
        <span className="absolute right-4 top-4 rounded-sm bg-pending px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-ink-950">{recurso.estado}</span>
      )}
    </article>
  );
}

export function formatoFecha(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(y, m - 1, d));
}

export function DocumentChecklist({ documentos }: { documentos: string[] }) {
  return (
    <div className="border border-line bg-paper p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <ListChecks aria-hidden strokeWidth={1.5} className="size-6 text-brand-ink" />
        <h2 className="text-2xl text-ink sm:text-3xl">Documentación que podría requerirse</h2>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {documentos.map((d) => (
          <li key={d} className="flex gap-3 text-[0.95rem]">
            <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-brand" />
            <span>{d}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-slate">
        La documentación definitiva depende de cada caso y de la vía aplicable. No envíes documentos a través de los formularios del
        sitio: se solicitan, si corresponde, durante la consulta.
      </p>
    </div>
  );
}

export function Fuentes({ fuentes }: { fuentes: { nombre: string; url: string }[] }) {
  if (!fuentes.length) return null;
  return (
    <div className="mt-10 border-t border-line pt-6">
      <h2 className="font-sans text-sm font-bold uppercase tracking-[0.14em] text-slate">Referencias normativas</h2>
      <ul className="mt-3 space-y-1.5 text-sm">
        {fuentes.map((f) => (
          <li key={f.url}>
            <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-brand/60 underline-offset-4 hover:decoration-brand">
              {f.nombre}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Prose({ html, className }: { html: string; className?: string }) {
  return <div className={cx("prose-lx", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
