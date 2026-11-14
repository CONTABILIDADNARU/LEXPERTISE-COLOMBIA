import { equipoPublicable, getRecursosVisibles } from "@/lib/content";
import { IS_PRODUCTION } from "@/lib/env";
import { enlaceWhatsApp } from "@/lib/settings";
import { Logo } from "./Logo";
import { DesktopNav, MobileMenu, type NavItem } from "./Navigation";
import { ButtonLink, Container } from "./ui";

export function getNavItems(): NavItem[] {
  const items: (NavItem | false)[] = [
    { href: "/", label: "Inicio" },
    { href: "/personas", label: "Personas" },
    { href: "/empresas", label: "Empresas" },
    { href: "/servicios", label: "Áreas de práctica" },
    (!IS_PRODUCTION || equipoPublicable()) && { href: "/equipo", label: "Equipo" },
    (!IS_PRODUCTION || getRecursosVisibles().length > 0) && { href: "/recursos", label: "Recursos" },
    { href: "/contacto", label: "Contacto" },
  ];
  return items.filter(Boolean) as NavItem[];
}

export function Header() {
  const items = getNavItems();
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/92 backdrop-blur supports-[backdrop-filter]:bg-ivory/80">
      <Container className="flex h-[4.5rem] max-w-7xl items-center justify-between gap-6">
        <Logo />
        <DesktopNav items={items} />
        <div className="flex items-center gap-2">
          <div className="hidden xl:block">
            <ButtonLink href="/agendar-consulta" variante="link" className="min-h-10 whitespace-nowrap px-2 text-sm">
              Agendar consulta
            </ButtonLink>
          </div>
          <div className="hidden lg:block">
            <ButtonLink href="/contacto" className="min-h-10 whitespace-nowrap px-4 py-2 text-sm">
              Solicitar información
            </ButtonLink>
          </div>
          <MobileMenu items={items} whatsappHref={enlaceWhatsApp("general")} />
        </div>
      </Container>
    </header>
  );
}
