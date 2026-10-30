import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import type { Category } from "@/lib/data/catalog";
import type { Settings } from "@/lib/data/site";
import { dayRange, groupOpeningHours } from "@/lib/hours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { addressLines, businessWhatsAppUrl } from "@/lib/site";
import { LanguageSwitch } from "./language-switch";

export function Footer({
  locale,
  dict,
  settings,
  categories,
}: {
  locale: Locale;
  dict: Dictionary;
  settings: Settings;
  categories: Category[];
}) {
  const path = (p: string) => localePath(locale, p);
  const whatsapp = businessWhatsAppUrl(settings, dict.whatsapp.messages.general);
  const slogan = localized(settings, "slogan", locale) ?? dict.home.heroTitleFallback;
  const hours = groupOpeningHours(settings.openingHours);
  const socials = [
    { href: settings.socials.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.socials.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: settings.socials.instagram, label: "Instagram", Icon: InstagramIcon },
  ].filter((s): s is typeof s & { href: string } => Boolean(s.href));

  const heading = "mb-5 text-[11px] font-medium uppercase tracking-[0.3em] text-gold-soft";
  const link = "text-sm text-ivory/75 transition-colors hover:text-ivory";

  return (
    <footer className="bg-plum pb-28 text-ivory">
      <Container className="flex flex-col items-center gap-8 py-16 text-center md:py-20">
        <p className="max-w-3xl font-display text-4xl leading-tight italic md:text-6xl">{slogan}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {whatsapp && (
            <ButtonAnchor href={whatsapp} target="_blank" rel="noopener noreferrer" variant="light">
              <WhatsAppIcon className="text-whatsapp" />
              {dict.whatsapp.chat}
            </ButtonAnchor>
          )}
          <ButtonLink href={path("/book")} variant="outlineLight">
            {dict.nav.book}
          </ButtonLink>
        </div>
      </Container>
      <Container>
        <div className="hairline" />
      </Container>
      <Container className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <Logo light className="w-32" />
          <p className="max-w-xs text-sm leading-6 text-ivory/70">{dict.footer.tagline}</p>
          {socials.length > 0 && (
            <ul className="flex gap-2" aria-label={dict.footer.follow}>
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-full border border-ivory/20 text-ivory/80 transition-colors hover:border-ivory hover:bg-ivory hover:text-plum"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label={dict.footer.shop}>
          <h2 className={heading}>{dict.footer.shop}</h2>
          <ul className="flex flex-col gap-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={path(`/shop/${c.slug}`)} className={link}>
                  {localized(c, "name", locale)}
                </Link>
              </li>
            ))}
            <li>
              <Link href={path("/shop")} className={link}>
                {dict.shop.all}
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label={dict.footer.help}>
          <h2 className={heading}>{dict.footer.help}</h2>
          <ul className="flex flex-col gap-3">
            <li>
              <Link href={path("/services")} className={link}>
                {dict.nav.services}
              </Link>
            </li>
            <li>
              <Link href={path("/faq")} className={link}>
                {dict.nav.faq}
              </Link>
            </li>
            <li>
              <Link href={path("/reviews")} className={link}>
                {dict.nav.reviews}
              </Link>
            </li>
            <li>
              <Link href={path("/booking-policy")} className={link}>
                {dict.footer.bookingPolicy}
              </Link>
            </li>
            <li>
              <Link href={path("/returns")} className={link}>
                {dict.footer.returns}
              </Link>
            </li>
            <li>
              <Link href={path("/privacy")} className={link}>
                {dict.footer.privacy}
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className={heading}>{dict.footer.visit}</h2>
          <address className="flex flex-col gap-1 text-sm leading-6 text-ivory/75 not-italic">
            <span className="text-ivory">{settings.businessName}</span>
            {addressLines(settings, locale).map((line) => (
              <span key={line}>{line}</span>
            ))}
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="mt-2 hover:text-ivory">
                {settings.phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="hover:text-ivory">
                {settings.email}
              </a>
            )}
          </address>
          {hours.length > 0 && (
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-ivory/75">
              {hours.map((group) => (
                <div key={group.from} className="contents">
                  <dt>{dayRange(group, dict.days)}</dt>
                  <dd className="tabular-nums">{"closed" in group ? dict.footer.closed : `${group.opens} – ${group.closes}`}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-ivory/10 pt-8 text-xs text-ivory/55 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.businessName}. {dict.footer.rights}
          </p>
          <LanguageSwitch locale={locale} className="[&_a]:text-ivory/55 [&_a:hover]:text-ivory [&_span[aria-current]]:text-ivory" />
        </div>
      </Container>
    </footer>
  );
}
