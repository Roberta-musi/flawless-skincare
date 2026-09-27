import { Search } from "lucide-react";
import Link from "next/link";
import { BagButton } from "@/components/bag/bag-button";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import type { Settings } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { businessWhatsAppUrl } from "@/lib/site";
import { LanguageSwitch } from "./language-switch";
import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";

export function Header({ locale, dict, settings }: { locale: Locale; dict: Dictionary; settings: Settings }) {
  const path = (p: string) => localePath(locale, p);
  const links = [
    { href: path("/shop"), label: dict.nav.shop },
    { href: path("/services"), label: dict.nav.services },
    { href: path("/about"), label: dict.nav.about },
    { href: path("/reviews"), label: dict.nav.reviews },
    { href: path("/contact"), label: dict.nav.contact },
  ];
  const whatsapp = businessWhatsAppUrl(settings, dict.whatsapp.messages.general);
  const announcement = localized(settings, "announcement", locale);

  return (
    <>
      {announcement && (
        <div className="bg-plum text-ivory">
          <Container className="flex h-9 items-center justify-center">
            <p className="truncate text-center text-[10px] tracking-[0.16em] uppercase sm:text-[11px] sm:tracking-[0.18em]">
              <span className="sm:hidden">{announcement.split(" · ")[0]}</span>
              <span className="hidden sm:inline">{announcement}</span>
            </p>
          </Container>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/85 backdrop-blur-md">
        <Container className="flex h-16 items-center gap-3 lg:h-20">
          <div className="flex flex-1 items-center">
            <MobileMenu
              locale={locale}
              links={[...links, { href: path("/faq"), label: dict.nav.faq }]}
              labels={{ menu: dict.nav.menu, open: dict.nav.openMenu, close: dict.nav.closeMenu, language: dict.nav.language }}
              book={{ href: path("/book"), label: dict.nav.book }}
              whatsapp={whatsapp ? { href: whatsapp, label: dict.whatsapp.chat } : null}
            />
            <nav aria-label={dict.nav.primary} className="hidden lg:block">
              <ul className="flex items-center gap-5 xl:gap-8">
                {links.map((link) => (
                  <li key={link.href}>
                    <NavLink href={link.href}>{link.label}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <Link href={path("/")} className="shrink-0" aria-label={`${dict.meta.siteName}, ${dict.nav.home}`}>
            <Logo eager className="w-24 lg:w-28 xl:w-32" />
          </Link>
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <Link
              href={`${path("/shop")}#search`}
              className="hidden size-11 place-items-center rounded-full text-plum transition-colors hover:bg-blush sm:grid"
              aria-label={dict.nav.search}
            >
              <Search className="size-5" strokeWidth={1.5} />
            </Link>
            <LanguageSwitch locale={locale} className="hidden px-2 sm:flex" />
            <BagButton label={dict.nav.openBag} />
            <ButtonLink href={path("/book")} variant="secondary" size="sm" className="ml-2 hidden lg:inline-flex">
              {dict.nav.book}
            </ButtonLink>
          </div>
        </Container>
      </header>
    </>
  );
}
