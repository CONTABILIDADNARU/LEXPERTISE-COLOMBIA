import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full px-4 sm:px-6 lg:px-8", className?.includes("max-w-") ? "" : "max-w-6xl", className)}>{children}</div>;
}

type Tono = "ivory" | "paper" | "mist" | "dark";
const TONOS: Record<Tono, string> = {
  ivory: "bg-ivory text-graphite",
  paper: "bg-paper text-graphite",
  mist: "bg-mist text-graphite",
  dark: "bg-ledger text-ivory",
};

export function Section({
  children,
  tono = "ivory",
  className,
  id,
  labelledBy,
}: {
  children: ReactNode;
  tono?: Tono;
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx(TONOS[tono], "py-16 sm:py-20 lg:py-24", className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, dark, className }: { children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <p className={cx("eyebrow flex items-center gap-3", dark ? "text-bronze" : "text-bronze-ink", className)}>
      <span aria-hidden className={cx("h-px w-8", dark ? "bg-bronze" : "bg-bronze-ink")} />
      {children}
    </p>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  text,
  dark,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  text?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("max-w-2xl", className)}>
      {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
      <h2 id={id} className={cx("mt-4 text-3xl sm:text-4xl lg:text-[2.75rem]", dark ? "text-ivory" : "text-navy")}>
        {title}
      </h2>
      {text && <p className={cx("mt-4 text-base sm:text-lg", dark ? "text-ivory/75" : "text-slate")}>{text}</p>}
    </div>
  );
}

type Variante = "primary" | "secondary" | "bronze" | "ghost-dark" | "link";
const VARIANTES: Record<Variante, string> = {
  primary: "bg-navy text-ivory hover:bg-navy-700 border border-navy",
  secondary: "border border-navy/30 text-navy hover:border-navy hover:bg-navy/[0.04]",
  bronze: "bg-bronze text-navy-950 hover:bg-bronze-soft border border-bronze",
  "ghost-dark": "border border-ivory/35 text-ivory hover:border-ivory hover:bg-ivory/[0.06]",
  link: "text-navy underline decoration-bronze underline-offset-4 hover:decoration-2 px-0",
};

export function buttonClasses(variante: Variante = "primary", className?: string) {
  return cx(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] px-5 py-3 text-[0.9375rem] font-semibold transition-colors duration-200",
    VARIANTES[variante],
    className,
  );
}

export function ButtonLink({
  href,
  children,
  variante = "primary",
  className,
  flecha,
  ...rest
}: { href: string; variante?: Variante; flecha?: boolean } & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={buttonClasses(variante, className)} {...rest}>
      {children}
      {flecha && <ArrowRight aria-hidden className="size-4" />}
    </Link>
  );
}
