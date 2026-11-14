"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, MessageCircle, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { buttonClasses, cx } from "./ui";

export type NavItem = { href: string; label: string };

function activo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegación principal" className="hidden lg:block">
      <ul className="flex items-center gap-4 xl:gap-6">
        {items.map((it) => {
          const actual = activo(pathname, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={actual ? "page" : undefined}
                className={cx(
                  "relative whitespace-nowrap py-2 text-[0.9rem] font-medium transition-colors",
                  actual ? "text-navy" : "text-slate hover:text-navy",
                  "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-bronze after:transition-transform",
                  actual ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
                )}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileMenu({ items, whatsappHref }: { items: NavItem[]; whatsappHref: string | null }) {
  const [abierto, setAbierto] = useState(false);
  const [top, setTop] = useState(72);
  const pathname = usePathname();
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Cierra el menú al navegar.
  useEffect(() => setAbierto(false), [pathname]);

  useEffect(() => {
    if (!abierto) return;
    // El panel se alinea con el borde inferior real del encabezado (que puede tener avisos encima).
    setTop(Math.max(0, boton.current?.closest("header")?.getBoundingClientRect().bottom ?? 72));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
      // Mantiene el foco dentro del panel.
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  return (
    <div className="lg:hidden">
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls="menu-movil"
        onClick={() => setAbierto((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-[3px] border border-navy/20 text-navy"
      >
        {abierto ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
        <span className="sr-only">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
      </button>
      {abierto &&
        createPortal(
        <div
          id="menu-movil"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          style={{ top }}
          className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto border-t border-line bg-ivory lg:hidden"
        >
          <nav aria-label="Navegación principal" className="px-4 pb-10 pt-4 sm:px-6">
            <ul className="divide-y divide-line">
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={activo(pathname, it.href) ? "page" : undefined}
                    className="flex items-center justify-between py-4 font-serif text-2xl text-navy"
                  >
                    {it.label}
                    {activo(pathname, it.href) && <span aria-hidden className="size-1.5 rounded-full bg-bronze" />}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3">
              <Link href="/contacto" className={buttonClasses("primary")}>
                Solicitar información
              </Link>
              <Link href="/agendar-consulta" className={buttonClasses("secondary")}>
                Solicitar una consulta
              </Link>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("click_whatsapp", { ubicacion: "menu_movil", contexto: "general" })}
                  className={buttonClasses("secondary")}
                >
                  <MessageCircle aria-hidden className="size-4" /> Escribir por WhatsApp
                </a>
              )}
            </div>
          </nav>
        </div>,
          document.body,
        )}
    </div>
  );
}
