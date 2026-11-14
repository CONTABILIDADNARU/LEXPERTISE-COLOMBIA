import { ButtonLink, Container } from "@/components/ui";

export const metadata = { title: "Página no encontrada", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <section className="bg-ledger text-ivory">
      <Container className="py-24 sm:py-32">
        <p className="eyebrow text-bronze">Error 404</p>
        <h1 className="mt-5 max-w-2xl text-4xl sm:text-5xl">No encontramos la página que buscas.</h1>
        <p className="mt-5 max-w-xl text-lg text-ivory/75">Es posible que la dirección haya cambiado o que la página ya no esté disponible.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" variante="bronze">
            Ir al inicio
          </ButtonLink>
          <ButtonLink href="/servicios" variante="ghost-dark">
            Ver áreas de práctica
          </ButtonLink>
          <ButtonLink href="/contacto" variante="ghost-dark">
            Contacto
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
