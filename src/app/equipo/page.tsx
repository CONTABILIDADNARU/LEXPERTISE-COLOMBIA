import Image from "next/image";
import { UserRound } from "lucide-react";
import { ServiceCard } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { ContactCTA } from "@/components/sections";
import { Section } from "@/components/ui";
import { getArea } from "@/lib/areas";
import { getAreasPrincipales, getEquipo } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { sitio } from "@/lib/settings";

export const metadata = buildMetadata({
  title: "Equipo de profesionales",
  description: "El equipo de LEXPERTISE COLOMBIA S.A.S cubre todas las áreas de práctica de la firma, para personas y empresas en Colombia.",
  path: "/equipo",
});

/**
 * Mientras no haya perfiles verificados (content/equipo/*.json con "verificado": true), la página
 * muestra un texto general: el equipo cubre todas las áreas de práctica (decisión de la firma, 17-nov-2026).
 * Nunca se usan fotografías generadas ni de banco presentadas como el equipo real.
 */
export default function EquipoPage() {
  const equipo = getEquipo();
  const areas = getAreasPrincipales();

  return (
    <>
      <PageHero
        migas={[
          { nombre: "Inicio", href: "/" },
          { nombre: "Equipo", href: "/equipo" },
        ]}
        eyebrow="Equipo"
        titulo="Profesionales que estudian cada asunto con cuidado."
        texto="Abogados y abogadas que acompañan a personas y empresas en las áreas de práctica de la firma."
      />
      <Section tono="ivory">
        {equipo.length === 0 ? (
          <>
            <div className="max-w-2xl">
              <h2 className="text-3xl text-ink sm:text-4xl">Cubrimos todas las áreas de práctica de la firma.</h2>
              <p className="mt-4 text-lg text-slate">
                {sitio.marca} cuenta con profesionales del derecho para cada una de las áreas que encuentras en este sitio, tanto para personas
                como para empresas.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {areas.map((a) => (
                <ServiceCard key={a.slug} servicio={a} />
              ))}
            </div>
          </>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {equipo.map((m) => (
              <li key={m.nombre} className="border border-line bg-paper">
                <div className="relative aspect-[4/5] bg-mist">
                  {m.foto ? (
                    <Image src={m.foto} alt={`Fotografía de ${m.nombre}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  ) : (
                    <UserRound aria-hidden strokeWidth={1} className="absolute inset-0 m-auto size-20 text-slate/40" />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl text-ink">{m.nombre}</h2>
                  <p className="mt-1 text-sm font-semibold text-brand-ink">{m.cargo}</p>
                  {m.tarjetaProfesional && <p className="mt-1 text-xs text-slate">T.P. {m.tarjetaProfesional}</p>}
                  {m.perfil && <p className="mt-4 text-[0.95rem] text-slate">{m.perfil}</p>}
                  {m.areas.length > 0 && (
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate">{m.areas.map((a) => getArea(a)?.corto).join(" · ")}</p>
                  )}
                  {m.formacion.length > 0 && (
                    <ul className="mt-4 space-y-1 text-sm text-slate">
                      {m.formacion.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <ContactCTA titulo="Conoce nuestros canales de atención jurídica." texto="Cuéntanos de forma general qué asunto necesitas revisar." />
    </>
  );
}
