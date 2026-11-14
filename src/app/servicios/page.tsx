import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { PageHero } from "@/components/PageHero";
import { ContactCTA } from "@/components/sections";
import { Container } from "@/components/ui";
import { AREAS } from "@/lib/areas";
import { getServicio, getServiciosVisibles, servicioVisible } from "@/lib/content";
import { IS_PRODUCTION } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Áreas de práctica y servicios jurídicos",
  description:
    "Directorio de áreas de práctica de LEXPERTISE: familia y sucesiones, laboral, civil y contratos, comercial, tributario, administrativo, y propiedad intelectual.",
  path: "/servicios",
});

export default function ServiciosPage() {
  const visibles = getServiciosVisibles();
  const grupos = AREAS.map((a) => ({
    area: a,
    principal: getServicio(a.slug),
    servicios: visibles.filter((s) => s.area === a.key && s.slug !== a.slug),
  })).filter((g) => g.principal && servicioVisible(g.principal));

  return (
    <>
      <PageHero
        migas={[
          { nombre: "Inicio", href: "/" },
          { nombre: "Áreas de práctica", href: "/servicios" },
        ]}
        eyebrow="Directorio"
        titulo="Áreas de práctica"
        texto="Encuentra el área que corresponde a tu asunto. Cada página explica, en términos generales, cómo se estudia y qué información conviene preparar."
      />
      <Container className="py-14 sm:py-20">
        <ul className="divide-y divide-line border-y border-line">
          {grupos.map(({ area, principal, servicios }) => (
            <li key={area.key} className="grid gap-6 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-12">
              <div className="flex gap-5">
                <span className="inline-flex size-12 shrink-0 items-center justify-center border border-bronze/60 text-navy">
                  <AreaIcon area={area.key} className="size-6" />
                </span>
                <div>
                  <h2 className="text-2xl text-navy sm:text-3xl">
                    <Link href={`/${principal!.slug}`} className="hover:underline">
                      {area.nombre}
                    </Link>
                  </h2>
                  <p className="mt-2 text-[0.95rem] text-slate">{principal!.resumen}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate">
                    {area.publicos.map((p) => (p === "persona" ? "Personas" : "Empresas")).join(" · ")}
                    {!IS_PRODUCTION && principal!.estado !== "activo" && <span className="ml-2 bg-pending px-1 text-navy-950">Por confirmar</span>}
                  </p>
                </div>
              </div>
              <ul className="grid content-start gap-1">
                <li>
                  <Link href={`/${principal!.slug}`} className="group flex items-center justify-between gap-4 py-2 font-semibold text-navy">
                    Información del área <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
                {servicios.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/${s.slug}`} className="group flex items-center justify-between gap-4 border-t border-line/70 py-2 text-navy">
                      {s.titulo} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-slate">LEXPERTISE no presta servicios de derecho penal.</p>
      </Container>
      <ContactCTA titulo="¿No sabes qué área corresponde a tu asunto?" texto="Cuéntanos de forma general qué ocurre y te orientaremos sobre el área y las alternativas de atención." />
    </>
  );
}
