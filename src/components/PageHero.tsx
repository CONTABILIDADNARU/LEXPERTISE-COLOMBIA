import type { ReactNode } from "react";
import type { Miga } from "@/lib/seo";
import { Breadcrumbs } from "./blocks";
import { Container, Eyebrow, cx } from "./ui";

export function PageHero({
  migas,
  eyebrow,
  titulo,
  texto,
  oscuro = true,
  children,
}: {
  migas: Miga[];
  eyebrow?: string;
  titulo: string;
  texto?: string;
  oscuro?: boolean;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby="titulo-pagina" className={oscuro ? "bg-ledger text-ivory" : "border-b border-line bg-paper text-graphite"}>
      <Container className="py-14 sm:py-20">
        <div className="max-w-3xl">
          <Breadcrumbs migas={migas} dark={oscuro} />
          {eyebrow && <Eyebrow dark={oscuro} className="mt-8">{eyebrow}</Eyebrow>}
          <h1 id="titulo-pagina" className={cx("mt-5 text-4xl leading-[1.06] sm:text-5xl lg:text-[3.5rem]", oscuro ? "text-ivory" : "text-ink")}>
            {titulo}
          </h1>
          {texto && <p className={cx("mt-6 max-w-2xl text-lg", oscuro ? "text-ivory/75" : "text-slate")}>{texto}</p>}
          {children}
        </div>
      </Container>
    </section>
  );
}
