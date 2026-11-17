import Link from "next/link";
import { cx } from "./ui";

/** Logotipo tipográfico provisional hasta recibir el logotipo oficial: «LEXPERTISE» con «Colombia» debajo. */
export function Logo({ dark, className }: { dark?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="LEXPERTISE Colombia, ir al inicio" className={cx("group inline-flex flex-col leading-none", className)}>
      <span className="inline-flex items-baseline gap-2 font-serif text-[1.35rem] tracking-[0.14em]">
        <span className={dark ? "text-ivory" : "text-navy"}>LEXPERTISE</span>
        <span aria-hidden className="mb-[3px] inline-block size-1.5 rounded-full bg-bronze transition-transform group-hover:scale-125" />
      </span>
      <span aria-hidden className={cx("mt-1.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.5em]", dark ? "text-bronze" : "text-bronze-ink")}>
        Colombia
      </span>
    </Link>
  );
}
