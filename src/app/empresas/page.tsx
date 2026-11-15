import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, Calculator, FileSearch, Tag, Users } from "lucide-react";
import { ProcessSteps } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { Pending } from "@/components/Pending";
import { ContactCTA } from "@/components/sections";
import { buttonClasses, Section, SectionHeading } from "@/components/ui";
import { getServicio, servicioVisible } from "@/lib/content";
import { IS_PRODUCTION } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Asesoría jurídica para empresas",
  description:
    "Servicios jurídicos para empresas y emprendedores: contratos comerciales, asuntos laborales para empleadores, revisión de documentos, marcas y asuntos tributarios.",
  path: "/empresas",
});

type Linea = { titulo: string; texto: string; enlaces: string[]; Icon: typeof Building2; pendiente?: string };

const LINEAS: Linea[] = [
  {
    titulo: "Contratos comerciales",
    texto: "Elaboración y revisión de contratos con clientes, proveedores y aliados: obligaciones, pagos, plazos, garantías y terminación.",
    enlaces: ["derecho-comercial", "derecho-civil-y-contratos"],
    Icon: Building2,
  },
  {
    titulo: "Asuntos laborales para empleadores",
    texto: "Contratación, documentos laborales, terminaciones y prevención de controversias con trabajadores.",
    enlaces: ["derecho-laboral"],
    Icon: BriefcaseBusiness,
  },
  {
    titulo: "Revisión jurídica de documentos",
    texto: "Análisis de documentos antes de firmarlos o de tomar una decisión, con explicación de riesgos y alternativas.",
    enlaces: ["derecho-civil-y-contratos"],
    Icon: FileSearch,
  },
  {
    titulo: "Asuntos societarios",
    texto: "Acompañamiento en asuntos entre socios y de la sociedad.",
    enlaces: [],
    Icon: Users,
    pendiente: "Confirmar si la firma presta asuntos societarios",
  },
  {
    titulo: "Propiedad intelectual y marcas",
    texto: "Búsqueda de antecedentes, solicitud de registro de marca y orientación sobre la protección del nombre del negocio.",
    enlaces: ["propiedad-intelectual-y-marcas"],
    Icon: Tag,
  },
  {
    titulo: "Asuntos tributarios y administrativos",
    texto: "Orientación jurídica frente a obligaciones y actuaciones de autoridades tributarias y entidades públicas.",
    enlaces: ["derecho-tributario", "derecho-administrativo"],
    Icon: Calculator,
  },
];

const PROCESO_B2B = [
  { titulo: "Solicitud", texto: "Nos indicas el tipo de asunto y el contexto general de la empresa. No pedimos NIT ni documentos en esta etapa." },
  { titulo: "Reunión de diagnóstico", texto: "Revisamos el asunto, los documentos pertinentes y las prioridades del negocio." },
  { titulo: "Propuesta de servicios", texto: "Definimos alcance, entregables y honorarios antes de iniciar cualquier trabajo." },
  { titulo: "Ejecución", texto: "Desarrollamos el servicio según las condiciones acordadas." },
];

export default function EmpresasPage() {
  const lineas = LINEAS.map((l) => ({
    ...l,
    paginas: l.enlaces.map((slug) => getServicio(slug)).filter((s) => s && servicioVisible(s)),
  })).filter((l) => (l.pendiente ? !IS_PRODUCTION : l.paginas.length > 0));

  return (
    <>
      <PageHero
        migas={[
          { nombre: "Inicio", href: "/" },
          { nombre: "Empresas", href: "/empresas" },
        ]}
        eyebrow="Para empresas"
        titulo="Servicios jurídicos para la actividad empresarial."
        texto="Acompañamiento para propietarios, socios, emprendedores y equipos que necesitan reducir errores contractuales, laborales y operativos."
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#solicitud" className={buttonClasses("bronze")}>
            Agendar consulta <ArrowRight aria-hidden className="size-4" />
          </a>
        </div>
      </PageHero>

      <Section tono="ivory" labelledBy="lineas-empresas">
        <SectionHeading id="lineas-empresas" eyebrow="Servicios" title="Materias en las que acompañamos a empresas" />
        <div className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {lineas.map(({ titulo, texto, Icon, paginas, pendiente }) => (
            <article key={titulo} className="flex flex-col bg-paper p-7">
              <Icon aria-hidden strokeWidth={1.4} className="size-7 text-bronze-ink" />
              <h3 className="mt-6 text-2xl text-navy">{titulo}</h3>
              <p className="mt-3 flex-1 text-[0.95rem] text-slate">{texto}</p>
              {pendiente && <Pending campo={pendiente} className="mt-4 self-start" />}
              {paginas.length > 0 && (
                <ul className="mt-6 space-y-1.5">
                  {paginas.map((p) => (
                    <li key={p!.slug}>
                      <Link href={`/${p!.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:underline">
                        {p!.titulo} <ArrowRight aria-hidden className="size-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
        {!IS_PRODUCTION && (
          <p className="mt-6 text-sm text-slate">
            <Pending campo="Modelo de acompañamiento recurrente (solo si la firma lo confirma)" />
          </p>
        )}
      </Section>

      <Section tono="dark" labelledBy="proceso-empresas">
        <SectionHeading id="proceso-empresas" eyebrow="Cómo trabajamos" title="Un proceso claro desde la primera conversación." dark />
        <div className="mt-12">
          <ProcessSteps pasos={PROCESO_B2B} dark nota="Los honorarios y el alcance se informan antes de iniciar. No se garantizan resultados." />
        </div>
      </Section>

      <ContactCTA
        titulo="Cuéntanos qué necesita tu empresa."
        texto="Indica el área y el contexto general. El nombre de la empresa es opcional y no pedimos NIT ni documentos en el primer contacto."
        preset={{ publico: "empresa" }}
        contexto="empresas"
      />
    </>
  );
}
