import type { Metadata } from "next";
import { Prose, ReviewBanner, formatoFecha } from "./blocks";
import { PageHero } from "./PageHero";
import { Pending } from "./Pending";
import { Container } from "./ui";
import { getDocumentoLegal } from "@/lib/content";
import { renderMarkdown, reemplazarVariables } from "@/lib/markdown";
import { buildMetadata } from "@/lib/seo";

export function legalMetadata(slug: string): Metadata {
  const d = getDocumentoLegal(slug);
  return buildMetadata({ title: d.seo.title, description: d.seo.description, path: `/${slug}` });
}

/** Documento legal con variables {{...}} reemplazadas por los datos oficiales de la firma. */
export async function LegalPage({ slug }: { slug: string }) {
  const d = getDocumentoLegal(slug);
  const html = await renderMarkdown(reemplazarVariables(d.cuerpo, { fechaVigencia: d.vigenteDesde ? formatoFecha(d.vigenteDesde) : "" }));
  return (
    <>
      <ReviewBanner estado={d.revision.estado} notas={d.notasRevision} tipo="política" />
      <PageHero
        oscuro={false}
        migas={[
          { nombre: "Inicio", href: "/" },
          { nombre: d.titulo, href: `/${slug}` },
        ]}
        eyebrow="Información legal"
        titulo={d.titulo}
      >
        <p className="mt-5 text-sm text-slate">
          Versión {d.version} · Vigente desde: {d.vigenteDesde ? formatoFecha(d.vigenteDesde) : <Pending campo="Fecha de vigencia" />}
        </p>
      </PageHero>
      <Container className="py-12 sm:py-16">
        <Prose html={html} />
      </Container>
    </>
  );
}
