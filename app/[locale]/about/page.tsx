import type { Metadata } from "next";
import Image from "next/image";
import { WhatsAppIcon } from "@/components/icons";
import { ProductImage } from "@/components/product/product-image";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { YearsOfCare } from "@/components/site/years-of-care";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/layout";
import { Prose } from "@/components/ui/prose";
import { getCatalog } from "@/lib/data/catalog";
import { getBrandProfile, getSettings } from "@/lib/data/site";
import { localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { mediaUrl } from "@/lib/media/url";
import { pageMetadata } from "@/lib/seo";
import { businessWhatsAppUrl, siteUrl } from "@/lib/site";
import { absoluteUrl } from "@/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  const brand = await getBrandProfile();
  return pageMetadata({
    locale,
    path: "/about",
    title: brand.ceoName ? `${dict.about.title} · ${brand.ceoName}` : dict.about.title,
    description: localized(brand, "shortBio", locale) ?? dict.about.intro,
  });
}

export default async function AboutPage() {
  const { locale, dict } = await getI18n();
  const [brand, settings, catalog] = await Promise.all([getBrandProfile(), getSettings(), getCatalog()]);
  const whatsapp = businessWhatsAppUrl(settings, dict.whatsapp.messages.general);
  const storyImage = settings.shopPhotoKey ?? catalog.categories.find((c) => c.imageKey)?.imageKey ?? null;
  const title = localized(brand, "ceoTitle", locale);
  const quote = localized(brand, "quote", locale);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: dict.common.home, href: localePath(locale, "/") },
          { label: dict.about.title, href: localePath(locale, "/about") },
        ]}
        eyebrow={dict.about.eyebrow}
        title={dict.about.title}
        intro={dict.about.intro}
      />

      {localized(brand, "brandStory", locale) && (
        <Section>
          <Container className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
            <div className="flex flex-col gap-6">
              <Eyebrow>{dict.about.eyebrow}</Eyebrow>
              {brand.foundedYear && (
                <YearsOfCare
                  since={brand.foundedYear}
                  template={dict.common.yearsOfCare}
                  className="font-display text-5xl leading-tight text-fuchsia italic md:text-6xl"
                />
              )}
              <Prose source={localized(brand, "brandStory", locale)} className="text-lg leading-8 [&_p:first-child]:font-display [&_p:first-child]:text-2xl [&_p:first-child]:leading-snug [&_p:first-child]:text-plum" />
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <div aria-hidden className="absolute -inset-3 arch border border-gold-soft/70" />
              <ProductImage imageKey={storyImage} alt={dict.home.visitTitle} sizes="(min-width: 1024px) 40vw, 90vw" className="arch aspect-[4/5]" />
            </div>
          </Container>
        </Section>
      )}

      {brand.ceoName && (
        <section className="relative overflow-hidden bg-plum text-ivory">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_20%,rgb(168_18_111/0.28)_0%,transparent_70%)]" />
          <Container className="relative grid grid-cols-[minmax(0,1fr)] gap-14 py-20 md:py-28 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
            <div className="relative mx-auto w-full max-w-[22rem] lg:sticky lg:top-28 lg:self-start">
              <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 arch border border-gold/60" />
              {brand.portraitKey ? (
                <ProductImage imageKey={brand.portraitKey} alt={brand.ceoName} sizes="(min-width: 1024px) 28vw, 80vw" className="arch aspect-[3/4]" />
              ) : (
                <div className="arch grid aspect-[3/4] place-items-center bg-[radial-gradient(circle_at_50%_30%,var(--color-plum-soft)_0%,var(--color-plum)_75%)]">
                  <Image src="/brand/butterfly-gold.png" unoptimized alt="" width={120} height={123} className="w-16 opacity-90" />
                </div>
              )}
            </div>
            <div className="flex flex-col items-start gap-6">
              <Eyebrow className="text-gold-soft">{dict.about.founderEyebrow}</Eyebrow>
              <div className="flex flex-col gap-3">
                <h2 className="text-5xl leading-[1.02] md:text-6xl">{brand.ceoName}</h2>
                {title && <p className="text-[12px] tracking-[0.24em] text-ivory/60 uppercase">{title}</p>}
              </div>
              {quote && <blockquote className="font-display text-3xl leading-snug text-ivory/90 italic md:text-4xl">“{quote}”</blockquote>}
              <Prose
                source={localized(brand, "story", locale) ?? localized(brand, "shortBio", locale)}
                className="text-base leading-8 text-ivory/80 [&_h2]:text-ivory [&_h3]:text-ivory [&_strong]:text-ivory"
              />
            </div>
          </Container>
        </section>
      )}

      <Section className="bg-cream/70">
        <Container>
          <SectionHeading title={dict.about.valuesTitle} />
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {dict.about.values.map((value, i) => (
              <li key={value.title} className="flex flex-col gap-4 rounded-[1.5rem] bg-white p-8 ring-1 ring-line">
                <span className="font-display text-5xl leading-none text-gold-deep italic">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-2xl">{value.title}</h3>
                <p className="text-sm leading-6 text-muted">{value.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={localePath(locale, "/contact")}>{dict.about.visitCta}</ButtonLink>
            {whatsapp && (
              <ButtonAnchor href={whatsapp} target="_blank" rel="noopener noreferrer" variant="whatsapp">
                <WhatsAppIcon />
                {dict.whatsapp.chat}
              </ButtonAnchor>
            )}
          </div>
        </Container>
      </Section>

      {brand.ceoName && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "AboutPage",
            url: `${siteUrl()}${localePath(locale, "/about")}`,
            mainEntity: {
              "@type": "Person",
              name: brand.ceoName,
              jobTitle: title ?? undefined,
              description: localized(brand, "shortBio", locale) ?? undefined,
              image: brand.portraitKey ? absoluteUrl(siteUrl(), mediaUrl(brand.portraitKey, 800)) : undefined,
              worksFor: { "@id": `${siteUrl()}/#business` },
              sameAs: Object.values(brand.ceoSocials).filter(Boolean),
            },
          }}
        />
      )}
    </>
  );
}
