import Image from "next/image";
import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Pending } from "@/components/Pending";
import { ContactCTA } from "@/components/sections";
import { Section } from "@/components/ui";
import { getArea } from "@/lib/areas";
import { getEquipo } from "@/lib/content";
import { IS_PRODUCTION } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Equipo de profesionales",
  description: "Conoce a los profesionales de LEXPERTISE, su formación y las áreas en las que acompañan a personas y empresas en Colombia.",
  path: "/equipo",
});

/**
 * La página solo se publica con perfiles verificados (content/equipo/*.json con "verificado": true).
 * Nunca se usan fotografías generadas ni de banco presentadas como el equipo real.
 */
export default function EquipoPage() {
  const equipo = getEquipo();
  if (IS_PRODUCTION && equipo.length === 0) notFound();

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
          <div className="max-w-2xl border border-dashed border-amber-400 bg-paper p-8">
            <Pending campo="Perfiles verificados del equipo" />
            <p className="mt-4 text-slate">
              Esta sección se completará con información confirmada por LEXPERTISE: nombre, cargo, número de tarjeta profesional, formación,
              áreas y fotografía real. Mientras no existan perfiles verificados, la página no se publica en producción y el enlace del menú se
              oculta.
            </p>
          </div>
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
                  <h2 className="text-2xl text-navy">{m.nombre}</h2>
                  <p className="mt-1 text-sm font-semibold text-bronze-ink">{m.cargo}</p>
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
