import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui";
import { AREAS } from "@/lib/areas";
import { getRecursosVisibles } from "@/lib/content";
import { IS_PRODUCTION } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Recursos jurídicos y guías prácticas",
  description: "Explicaciones generales sobre divorcios, contratos, asuntos laborales, sucesiones y marcas en Colombia, revisadas por el equipo jurídico de LEXPERTISE COLOMBIA S.A.S.",
  path: "/recursos",
});

export default function RecursosPage() {
  const recursos = getRecursosVisibles();
  if (IS_PRODUCTION && recursos.length === 0) notFound();
  const categorias = AREAS.filter((a) => recursos.some((r) => r.categoria === a.key));

  return (
    <>
      <PageHero
        migas={[
          { nombre: "Inicio", href: "/" },
          { nombre: "Recursos", href: "/recursos" },
        ]}
        eyebrow="Recursos jurídicos"
        titulo="Conceptos claros antes de tomar decisiones."
        texto="Artículos y videos del equipo con información general. Ninguno reemplaza el análisis de un caso concreto."
      />
      {categorias.map((cat, i) => (
        <Section key={cat.key} tono={i % 2 ? "paper" : "ivory"} labelledBy={`cat-${cat.key}`} className="py-14 sm:py-16 lg:py-20">
          <h2 id={`cat-${cat.key}`} className="text-3xl text-navy">
            {cat.nombre}
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recursos
              .filter((r) => r.categoria === cat.key)
              .map((r) => (
                <ArticleCard key={r.slug} recurso={r} />
              ))}
          </div>
        </Section>
      ))}
      {recursos.length === 0 && (
        <Section>
          <p className="text-slate">Aún no hay recursos publicados.</p>
        </Section>
      )}
    </>
  );
}
