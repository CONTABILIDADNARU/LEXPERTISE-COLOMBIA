import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { WhatsAppButton } from "@/components/ContactLinks";
import { Pending } from "@/components/Pending";
import { ButtonLink, Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { enlaceWhatsApp } from "@/lib/settings";

export const metadata = buildMetadata({
  title: "Solicitud recibida",
  description: "Recibimos tu solicitud. Un integrante del equipo de LEXPERTISE se pondrá en contacto contigo por el medio que elegiste.",
  path: "/gracias",
  noindex: true,
});

type Props = { searchParams: Promise<{ ref?: string; tipo?: string }> };

/**
 * Confirmación posterior al envío. Esta página no dispara conversiones: el evento se registra en el
 * formulario solo cuando el servidor confirma que la solicitud quedó guardada.
 */
export default async function GraciasPage({ searchParams }: Props) {
  const { ref, tipo } = await searchParams;
  const referencia = ref && /^LX-\d{8}-[A-Z0-9]{6}$/.test(ref) ? ref : null;
  const agendamiento = tipo === "agendamiento";
  return (
    <section className="bg-ledger text-ivory">
      <Container className="py-20 sm:py-28">
        <div className="max-w-2xl">
          <CircleCheck aria-hidden strokeWidth={1.3} className="size-12 text-bronze" />
          <h1 className="mt-6 text-4xl sm:text-5xl">{agendamiento ? "Recibimos tu solicitud de consulta." : "Recibimos tu solicitud."}</h1>
          {referencia && (
            <p className="mt-6 inline-block border border-ivory/20 px-4 py-2 text-sm">
              Número de referencia: <strong className="font-mono tracking-wide">{referencia}</strong>
            </p>
          )}
          <div className="mt-8 space-y-4 text-lg text-ivory/80">
            <p>
              {agendamiento
                ? "Un integrante del equipo revisará las fechas que propusiste y te contactará para confirmar la disponibilidad, la modalidad, el alcance y los honorarios. La cita no está confirmada hasta que recibas esa respuesta."
                : "Un integrante del equipo revisará la información y te contactará por el medio que elegiste para conocer tu asunto de forma general e informarte las alternativas de atención."}
            </p>
            <p className="text-base text-ivory/65">
              Enviar esta solicitud no genera obligaciones ni constituye una relación abogado-cliente. Mientras tanto, no es necesario que envíes
              documentos.
            </p>
            <Pending campo="Tiempo de respuesta comprometido" oscuro />
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/" variante="bronze">
              Volver al inicio
            </ButtonLink>
            <ButtonLink href="/recursos" variante="ghost-dark">
              Ver recursos jurídicos
            </ButtonLink>
            <WhatsAppButton href={enlaceWhatsApp("general")} contexto="general" ubicacion="gracias" variante="ghost-dark" />
          </div>
          <p className="mt-10 text-sm text-ivory/55">
            Si escribiste un dato de contacto incorrecto, puedes{" "}
            <Link href="/contacto" className="underline underline-offset-4">
              enviar una nueva solicitud
            </Link>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
