import { ArrowRight, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons";
import { ProductCard, type ProductCardDict } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { ReviewCard } from "@/components/review/review-card";
import { ServiceCard } from "@/components/service/service-card";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/layout";
import { cn } from "@/lib/cn";
import type { Catalog, ProductSummary } from "@/lib/data/catalog";
import type { PublicReview } from "@/lib/data/reviews";
import type { Service } from "@/lib/data/services";
import type { BrandProfile, Settings } from "@/lib/data/site";
import { dayRange, groupOpeningHours } from "@/lib/hours";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate, localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { addressLines, businessWhatsAppUrl, directionsUrl } from "@/lib/site";

type Props = { locale: Locale; dict: Dictionary };

function countLabel(dict: Dictionary, count: number) {
  return count === 1 ? dict.shop.resultsOne : interpolate(dict.shop.results, { count });
}

function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 self-start text-xs font-medium tracking-[0.16em] text-plum uppercase md:self-auto"
    >
      <span className="border-b border-plum/30 pb-1 transition-colors group-hover:border-fuchsia group-hover:text-fuchsia">{label}</span>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
    </Link>
  );
}

const tileTones = ["bg-blush", "bg-lilac", "bg-cream", "bg-blush-deep/60", "bg-lilac-deep/50", "bg-gold-soft/30"];

export function ConcernsSection({ locale, dict, catalog }: Props & { catalog: Catalog }) {
  const concerns = catalog.concerns
    .map((c) => ({ ...c, count: catalog.products.filter((p) => p.concernIds.includes(c.id)).length }))
    .filter((c) => c.count > 0);
  if (!concerns.length) return null;

  return (
    <Section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          align="left"
          eyebrow={dict.home.concernsEyebrow}
          title={dict.home.concernsTitle}
          action={<ViewAll href={localePath(locale, "/shop")} label={dict.common.viewAll} />}
        />
        <ul className="scrollbar-none -mx-5 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {concerns.map((concern, i) => (
            <li key={concern.id} className="snap-start">
              <Link
                href={localePath(locale, `/shop?concern=${concern.slug}`)}
                className={cn(
                  "group flex h-full min-h-40 w-44 flex-col justify-between gap-8 rounded-[1.25rem] p-5 transition-all duration-500 ease-(--ease-soft) hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgb(43_20_49/0.35)] sm:w-auto",
                  tileTones[i % tileTones.length],
                )}
              >
                <span className="font-display text-2xl leading-tight">{localized(concern, "name", locale)}</span>
                <span className="flex items-center justify-between text-[11px] tracking-[0.16em] text-plum/60 uppercase">
                  {countLabel(dict, concern.count)}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function ProductsSection({
  locale,
  dict,
  products,
  eyebrow,
  title,
  intro,
  href,
}: {
  locale: Locale;
  dict: ProductCardDict & Pick<Dictionary, "common">;
  products: ProductSummary[];
  eyebrow: string;
  title: string;
  intro?: string;
  href: string;
}) {
  if (!products.length) return null;
  return (
    <Section className="pt-8 md:pt-12">
      <Container>
        <SectionHeading
          align="left"
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          action={<ViewAll href={href} label={dict.common.viewAll} />}
        />
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} dict={dict} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function CategoriesSection({ locale, dict, catalog }: Props & { catalog: Catalog }) {
  if (!catalog.categories.length) return null;
  return (
    <Section className="bg-cream/70">
      <Container>
        <SectionHeading eyebrow={dict.home.categoriesEyebrow} title={dict.home.categoriesTitle} />
        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-5">
          {catalog.categories.map((category) => {
            const count = catalog.products.filter((p) => p.categoryId === category.id).length;
            const name = localized(category, "name", locale);
            return (
              <li key={category.id}>
                <Link href={localePath(locale, `/shop/${category.slug}`)} className="group flex flex-col items-center gap-4 text-center">
                  <ProductImage
                    imageKey={category.imageKey}
                    alt={name}
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="arch aspect-[3/4] w-full"
                    imageClassName="transition-transform duration-[1.2s] ease-(--ease-soft) group-hover:scale-[1.05]"
                  />
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-2xl transition-colors group-hover:text-fuchsia">{name}</span>
                    <span className="text-[11px] tracking-[0.18em] text-muted uppercase">{countLabel(dict, count)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

export function FounderSection({ locale, dict, brand }: Props & { brand: BrandProfile }) {
  if (!brand.ceoName) return null;
  const initials = brand.ceoName
    .split(/[\s-]+/)
    .map((part) => part[0])
    .slice(0, 3)
    .join("");
  const title = localized(brand, "ceoTitle", locale);
  const quote = localized(brand, "quote", locale);
  const bio = localized(brand, "shortBio", locale);

  return (
    <section className="relative overflow-hidden bg-plum text-ivory">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_15%_30%,rgb(168_18_111/0.28)_0%,transparent_70%)]"
      />
      <Container className="relative grid items-center gap-14 py-20 md:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="relative mx-auto w-full max-w-[22rem]">
          <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 arch border border-gold/60" />
          {brand.portraitKey ? (
            <ProductImage imageKey={brand.portraitKey} alt={brand.ceoName} sizes="(min-width: 1024px) 28vw, 80vw" className="arch aspect-[3/4]" />
          ) : (
            <div className="arch relative grid aspect-[3/4] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_30%,var(--color-plum-soft)_0%,var(--color-plum)_75%)]">
              <div className="flex flex-col items-center gap-5">
                <Image src="/brand/butterfly-gold.png" unoptimized alt="" width={120} height={123} className="w-16 opacity-90" />
                <span className="font-display text-6xl tracking-wide text-gold-soft italic">{initials}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-6">
          <Eyebrow className="text-gold-soft">{dict.home.founderEyebrow}</Eyebrow>
          <div className="flex flex-col gap-3">
            <h2 className="text-5xl leading-[1.02] md:text-6xl">{brand.ceoName}</h2>
            {title && <p className="text-[12px] tracking-[0.24em] text-ivory/60 uppercase">{title}</p>}
          </div>
          {quote && <blockquote className="font-display text-3xl leading-snug text-ivory/90 italic md:text-4xl">“{quote}”</blockquote>}
          {bio && <p className="max-w-xl text-base leading-8 text-ivory/75">{bio}</p>}
          <ButtonLink href={localePath(locale, "/about")} variant="outlineLight" className="mt-2">
            {dict.home.founderCta}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export function ServicesSection({ locale, dict, services }: Props & { services: Service[] }) {
  if (!services.length) return null;
  return (
    <Section>
      <Container>
        <SectionHeading
          align="left"
          eyebrow={dict.home.servicesEyebrow}
          title={dict.home.servicesTitle}
          intro={dict.home.servicesIntro}
          action={<ViewAll href={localePath(locale, "/services")} label={dict.common.viewAll} />}
        />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <li key={service.id}>
              <ServiceCard service={service} locale={locale} dict={dict} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function StepsSection({ locale, dict }: Props) {
  return (
    <Section className="bg-lilac/60">
      <Container className="flex flex-col items-center">
        <SectionHeading eyebrow={dict.home.stepsEyebrow} title={dict.home.stepsTitle} />
        <ol className="mt-14 grid w-full gap-12 md:grid-cols-3 md:gap-10">
          {dict.home.steps.map((step, i) => (
            <li key={step.title} className="flex flex-col items-center gap-4 text-center">
              <span className="font-display text-6xl leading-none text-gold italic">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-2xl">{step.title}</h3>
              <p className="max-w-xs text-sm leading-6 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <ButtonLink href={localePath(locale, "/shop")} className="mt-14">
          {dict.home.shopCta}
        </ButtonLink>
      </Container>
    </Section>
  );
}

export function ReviewsSection({ locale, dict, reviews }: Props & { reviews: PublicReview[] }) {
  if (!reviews.length) return null;
  return (
    <Section>
      <Container>
        <SectionHeading
          align="left"
          eyebrow={dict.home.reviewsEyebrow}
          title={dict.home.reviewsTitle}
          action={<ViewAll href={localePath(locale, "/reviews")} label={dict.common.viewAll} />}
        />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} locale={locale} dict={dict} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function VisitSection({ locale, dict, settings }: Props & { settings: Settings }) {
  const hours = groupOpeningHours(settings.openingHours);
  const whatsapp = businessWhatsAppUrl(settings, dict.whatsapp.messages.general);
  return (
    <Section>
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <ProductImage
          imageKey={settings.shopPhotoKey}
          alt={dict.home.visitTitle}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="aspect-[4/3] rounded-[2rem]"
        />
        <div className="flex flex-col items-start gap-6">
          <Eyebrow>{dict.home.visitEyebrow}</Eyebrow>
          <h2 className="text-4xl md:text-5xl">{dict.home.visitTitle}</h2>
          <address className="flex flex-col gap-1 text-base leading-7 text-plum/80 not-italic">
            {addressLines(settings, locale).map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          {hours.length > 0 && (
            <dl className="grid w-full max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-line py-4 text-sm">
              {hours.map((group) => (
                <div key={group.from} className="contents">
                  <dt className="text-muted">{dayRange(group, dict.days, false)}</dt>
                  <dd className="text-right tabular-nums">
                    {"closed" in group ? dict.footer.closed : `${group.opens} – ${group.closes}`}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonAnchor href={directionsUrl(settings)} target="_blank" rel="noopener noreferrer" variant="secondary">
              {dict.home.directions}
            </ButtonAnchor>
            {whatsapp ? (
              <ButtonAnchor href={whatsapp} target="_blank" rel="noopener noreferrer" variant="whatsapp">
                <WhatsAppIcon />
                {dict.whatsapp.chat}
              </ButtonAnchor>
            ) : (
              settings.phone && (
                <ButtonAnchor href={`tel:${settings.phone.replace(/\s/g, "")}`} variant="primary">
                  <Phone />
                  {settings.phone}
                </ButtonAnchor>
              )
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
