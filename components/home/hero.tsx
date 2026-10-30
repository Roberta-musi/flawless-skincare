import { MapPin, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductPrice } from "@/components/product/price";
import { ProductImage } from "@/components/product/product-image";
import { ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/layout";
import type { ProductSummary } from "@/lib/data/catalog";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate, localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";

function Emphasized({ text }: { text: string }) {
  const words = text.split(" ");
  const longest = words.reduce((best, word, i) => (word.replace(/\W/g, "").length > words[best].replace(/\W/g, "").length ? i : best), 0);
  return words.map((word, i) => (
    <span key={i}>
      {i > 0 && " "}
      {i === longest ? <em className="font-normal text-fuchsia">{word}</em> : word}
    </span>
  ));
}

export function Hero({
  locale,
  dict,
  slogan,
  foundedYear,
  images,
  spotlight,
}: {
  locale: Locale;
  dict: Dictionary;
  slogan: string;
  foundedYear: number | null;
  images: ProductSummary[];
  spotlight: ProductSummary | undefined;
}) {
  const [main, secondary] = images;
  const trust = [
    { icon: MessageCircle, label: dict.home.trustWhatsapp },
    { icon: Sparkles, label: dict.home.trustConsultation },
    { icon: MapPin, label: dict.home.trustShop },
  ];

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_55%_at_88%_18%,var(--color-lilac)_0%,transparent_65%),radial-gradient(45%_50%_at_0%_100%,var(--color-blush)_0%,transparent_70%)]"
      />
      <Container className="relative grid items-center gap-16 pt-12 pb-20 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-20 lg:pb-28">
        <div className="flex animate-rise flex-col items-start gap-7">
          <Eyebrow>{dict.home.heroEyebrow}</Eyebrow>
          <h1 className="text-[3.1rem] leading-[0.98] sm:text-7xl lg:text-[5.4rem] lg:leading-[0.95]">
            <Emphasized text={slogan} />
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted md:text-lg md:leading-8">{dict.home.heroIntro}</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href={localePath(locale, "/shop")} size="lg">
              {dict.home.shopCta}
            </ButtonLink>
            <ButtonLink href={localePath(locale, "/book?service=skin-consultation")} variant="secondary" size="lg">
              {dict.home.bookCta}
            </ButtonLink>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-plum/80">
            {foundedYear && (
              <li className="flex items-center gap-2">
                <span className="font-display text-lg text-gold-deep italic">{interpolate(dict.common.since, { year: foundedYear })}</span>
              </li>
            )}
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-gold" strokeWidth={1.5} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-[rise_1.1s_var(--ease-soft)_0.15s_both] sm:max-w-lg lg:max-w-none">
          <div className="relative ml-auto w-[80%] lg:w-[78%]">
            <div aria-hidden className="absolute -inset-3 arch border border-gold-soft/70" />
            <ProductImage
              imageKey={main?.image?.key}
              alt={main ? localized(main, "name", locale) : dict.meta.siteName}
              sizes="(min-width: 1024px) 38vw, 80vw"
              preload
              className="arch aspect-[4/5] shadow-[0_40px_80px_-40px_rgb(43_20_49/0.45)]"
            />
          </div>
          {secondary && (
            <ProductImage
              imageKey={secondary.image?.key}
              alt={localized(secondary, "name", locale)}
              sizes="(min-width: 1024px) 18vw, 40vw"
              className="absolute bottom-[18%] -left-2 aspect-square w-[42%] rounded-full border-[6px] border-ivory shadow-[0_30px_60px_-30px_rgb(43_20_49/0.5)] sm:left-0"
            />
          )}
          {spotlight && (
            <Link
              href={localePath(locale, `/products/${spotlight.slug}`)}
              className="absolute right-2 -bottom-6 flex max-w-[15rem] flex-col gap-1 rounded-2xl bg-white/95 px-5 py-4 shadow-[0_24px_50px_-24px_rgb(43_20_49/0.45)] ring-1 ring-line backdrop-blur transition-transform duration-500 hover:-translate-y-1 sm:right-6"
            >
              <span className="text-[10px] font-medium tracking-[0.24em] text-gold-deep uppercase">{dict.common.bestseller}</span>
              <span className="font-display text-lg leading-snug">{localized(spotlight, "name", locale)}</span>
              <ProductPrice variants={spotlight.variants} locale={locale} labels={dict.common} className="text-muted" />
            </Link>
          )}
          <Image
            src="/brand/butterfly-gold.png"
            unoptimized
            alt=""
            width={120}
            height={123}
            className="absolute top-2 left-[14%] w-10 -rotate-12 opacity-80 md:w-12"
          />
        </div>
      </Container>
    </section>
  );
}
