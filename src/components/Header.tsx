import { getRecursosVisibles } from "@/lib/content";
import { IS_PRODUCTION } from "@/lib/env";
import { Logo } from "./Logo";
import { DesktopNav, MobileMenu, type NavItem } from "./Navigation";
import { ButtonLink, Container } from "./ui";

export function getNavItems(): NavItem[] {
  const items: (NavItem | false)[] = [
    { href: "/", label: "Inicio" },
    { href: "/personas", label: "Personas" },
    { href: "/empresas", label: "Empresas" },
    { href: "/servicios", label: "Áreas de práctica" },
    { href: "/equipo", label: "Equipo" },
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
          <div className="hidden lg:block">
            <ButtonLink href="/agendar-consulta" className="min-h-10 whitespace-nowrap px-4 py-2 text-sm">
              Agendar consulta
            </ButtonLink>
          </div>
          <MobileMenu items={items} />
        </div>
      </Container>
    </header>
  );
}
