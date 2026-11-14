import Link from "next/link";
import { cx } from "./ui";

/** Logotipo tipográfico provisional hasta recibir el logotipo oficial. */
export function Logo({ dark, className }: { dark?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="LEXPERTISE, ir al inicio"
      className={cx("group inline-flex items-baseline gap-2 font-serif text-[1.35rem] leading-none tracking-[0.14em]", className)}
    >
      <span className={dark ? "text-ivory" : "text-navy"}>LEXPERTISE</span>
      <span aria-hidden className="mb-[3px] inline-block size-1.5 rounded-full bg-bronze transition-transform group-hover:scale-125" />
    </Link>
  );
}
