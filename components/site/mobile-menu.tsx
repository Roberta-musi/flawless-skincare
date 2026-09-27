"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { WhatsAppIcon } from "@/components/icons";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitch } from "./language-switch";
import { Sheet } from "./sheet";

export function MobileMenu({
  locale,
  links,
  labels,
  book,
  whatsapp,
  footnote,
}: {
  locale: Locale;
  links: { href: string; label: string }[];
  labels: { menu: string; open: string; close: string; language: string };
  book: { href: string; label: string };
  whatsapp: { href: string; label: string } | null;
  footnote?: string;
}) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();

  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpenedAt(pathname);
          setOpen(true);
        }}
        className="-ml-2 grid size-11 place-items-center rounded-full text-plum transition-colors hover:bg-blush lg:hidden"
        aria-label={labels.open}
        aria-expanded={open}
      >
        <Menu className="size-5.5" strokeWidth={1.5} />
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        side="left"
        label={labels.menu}
        closeLabel={labels.close}
        header={<Logo className="w-28" />}
      >
        <nav className="flex-1 overflow-y-auto px-5 py-6 sm:px-6" aria-label={labels.menu}>
          <ul className="flex flex-col">
            {links.map((link, index) => (
              <li key={link.href} className="border-b border-line/70">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4 py-4"
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  <span className="w-6 text-[11px] font-medium tracking-[0.2em] text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-3xl text-plum transition-colors group-hover:text-fuchsia group-aria-[current=page]:text-fuchsia">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-3 border-t border-line bg-cream/60 px-5 py-6 sm:px-6">
          <ButtonLink href={book.href} onClick={() => setOpen(false)} className="w-full">
            {book.label}
          </ButtonLink>
          {whatsapp && (
            <ButtonAnchor href={whatsapp.href} target="_blank" rel="noopener noreferrer" variant="whatsapp" className="w-full">
              <WhatsAppIcon />
              {whatsapp.label}
            </ButtonAnchor>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">{labels.language}</span>
            <LanguageSwitch locale={locale} />
          </div>
          {footnote && <p className="text-xs text-muted">{footnote}</p>}
        </div>
      </Sheet>
    </>
  );
}
