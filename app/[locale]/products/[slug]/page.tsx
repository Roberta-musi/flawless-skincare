import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/gallery";
import { ProductCard } from "@/components/product/product-card";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ReviewCard } from "@/components/review/review-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Prose } from "@/components/ui/prose";
import { Stars } from "@/components/ui/stars";
import { getCatalog, getProductBySlug, productTranslatableFields } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/site";
import { interpolate, isTranslated, localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { mediaUrl, ogImageUrl } from "@/lib/media/url";
import { pageMetadata } from "@/lib/seo";
import { businessWhatsAppUrl, siteUrl } from "@/lib/site";
import { absoluteUrl, productJsonLd, ratingSummary } from "@/lib/structured-data";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale } = await getI18n();
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  const name = localized(product, "name", locale);
  const image = product.images[0];
  return pageMetadata({
    locale,
    path: `/products/${product.slug}`,
    title: localized(product, "seoTitle", locale) ?? name,
    description: localized(product, "seoDescription", locale) ?? localized(product, "shortDescription", locale),
    images: image ? [{ url: ogImageUrl(image.key), width: 1200, height: 630, alt: name }] : undefined,
    translated: isTranslated(product, productTranslatableFields),
  });
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale, dict } = await getI18n();
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const settings = await getSettings();

  const name = localized(product, "name", locale);
  const path = localePath(locale, `/products/${product.slug}`);
  const url = `${siteUrl()}${path}`;
  const categoryName = product.category ? localized(product.category, "name", locale) : null;
  const benefits = localized(product, "benefits", locale);
  const rating = ratingSummary(product.reviews);
  const adviceUrl = businessWhatsAppUrl(settings, interpolate(dict.whatsapp.messages.service, { service: name }));

  const details = [
    benefits.length > 0 && {
      title: dict.product.benefits,
      body: (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] leading-7 text-plum/80 marker:text-gold">
          {benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      ),
    },
    localized(product, "description", locale) && { title: dict.product.details, body: <Prose source={localized(product, "description", locale)} /> },
    localized(product, "howToUse", locale) && { title: dict.product.howToUse, body: <Prose source={localized(product, "howToUse", locale)} /> },
    localized(product, "keyIngredients", locale) && {
      title: dict.product.keyIngredients,
      body: <Prose source={localized(product, "keyIngredients", locale)} />,
    },
    product.inci && { title: dict.product.inci, body: <p className="text-sm leading-6 text-muted">{product.inci}</p> },
    product.setItems.length > 0 && {
      title: dict.product.inThisSet,
      body: (
        <ul className="flex flex-col gap-2">
          {product.setItems.map(({ quantity, product: item }) => (
            <li key={item.id} className="flex items-baseline gap-2 text-[15px]">
              <span className="text-muted tabular-nums">{quantity} ×</span>
              <Link href={localePath(locale, `/products/${item.slug}`)} className="text-plum underline-offset-4 hover:text-fuchsia hover:underline">
                {localized(item, "name", locale)}
              </Link>
            </li>
          ))}
        </ul>
      ),
    },
  ].filter((item): item is { title: string; body: ReactElement } => Boolean(item));

  return (
    <>
      <Container className="pt-6 md:pt-8">
        <Breadcrumbs
          items={[
            { label: dict.common.home, href: localePath(locale, "/") },
            { label: dict.shop.title, href: localePath(locale, "/shop") },
            ...(product.category && categoryName
              ? [{ label: categoryName, href: localePath(locale, `/shop/${product.category.slug}`) }]
              : []),
            { label: name, href: path },
          ]}
        />
      </Container>

      <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 pt-6 pb-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:pb-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery
            images={product.images.map((image) => ({ key: image.key, alt: localized(image, "alt", locale) ?? name }))}
            name={name}
            labels={dict.product}
          />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex animate-rise flex-col gap-4">
            {product.category && categoryName && (
              <Link
                href={localePath(locale, `/shop/${product.category.slug}`)}
                className="self-start text-[11px] font-medium tracking-[0.3em] text-fuchsia uppercase hover:underline"
              >
                {categoryName}
              </Link>
            )}
            <h1 className="text-4xl leading-[1.05] md:text-5xl">{name}</h1>
            {rating && (
              <a href="#reviews" className="flex items-center gap-2 self-start text-sm text-muted hover:text-plum">
                <Stars rating={Math.round(rating.average)} label={interpolate(dict.common.ratingLabel, { rating: rating.average })} />
                {rating.count === 1 ? dict.product.reviewsCountOne : interpolate(dict.product.reviewsCount, { count: rating.count })}
              </a>
            )}
            {localized(product, "shortDescription", locale) && (
              <p className="text-lg leading-8 text-muted">{localized(product, "shortDescription", locale)}</p>
            )}
            {(product.concerns.length > 0 || product.skinTypes.length > 0) && (
              <dl className="mt-1 flex flex-col gap-2 text-sm">
                {product.concerns.length > 0 && (
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <dt className="text-muted">{dict.product.targets}:</dt>
                    {product.concerns.map((c) => (
                      <dd key={c.id}>
                        <Link href={localePath(locale, `/shop?concern=${c.slug}`)} className="rounded-full bg-blush px-3 py-1 text-xs text-fuchsia-deep hover:bg-blush-deep">
                          {localized(c, "name", locale)}
                        </Link>
                      </dd>
                    ))}
                  </div>
                )}
                {product.skinTypes.length > 0 && (
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <dt className="text-muted">{dict.product.suitableFor}:</dt>
                    {product.skinTypes.map((s) => (
                      <dd key={s.id} className="rounded-full bg-lilac px-3 py-1 text-xs text-plum">
                        {localized(s, "name", locale)}
                      </dd>
                    ))}
                  </div>
                )}
              </dl>
            )}
          </div>

          <PurchasePanel
            product={{ id: product.id, slug: product.slug, nameEn: product.nameEn, nameFr: product.nameFr, imageKey: product.images[0]?.key ?? null }}
            variants={product.variants}
            locale={locale}
            whatsappNumber={normalizeWhatsAppNumber(settings.whatsapp)}
            productUrl={url}
            dict={dict}
          />

          {adviceUrl && (
            <a
              href={adviceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-2xl bg-lilac/60 p-5 text-sm leading-6 text-plum transition-colors hover:bg-lilac"
            >
              <MessageCircle className="mt-0.5 size-5 shrink-0 text-fuchsia" strokeWidth={1.5} />
              <span>
                {dict.product.advice} <span className="font-medium text-fuchsia underline underline-offset-4">{dict.whatsapp.ask}</span>
              </span>
            </a>
          )}

          {details.length > 0 && (
            <div className="divide-y divide-line border-y border-line">
              {details.map((item, i) => (
                <AccordionItem key={item.title} title={item.title} open={i === 0}>
                  {item.body}
                </AccordionItem>
              ))}
            </div>
          )}
        </div>
      </Container>

      {product.pairings.length > 0 && (
        <Section className="bg-cream/70">
          <Container>
            <SectionHeading align="left" title={dict.product.pairsWith} />
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
              {product.pairings.slice(0, 4).map((pairing) => (
                <ProductCard key={pairing.id} product={pairing} locale={locale} dict={dict} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section id="reviews" className="scroll-mt-24">
        <Container>
          <SectionHeading
            align="left"
            title={dict.product.reviews}
            intro={rating ? interpolate(dict.common.ratingLabel, { rating: rating.average }) : undefined}
            action={
              <ButtonLink href={`${localePath(locale, "/reviews")}?product=${product.slug}#write`} variant="secondary" size="sm">
                {dict.product.writeReview}
              </ButtonLink>
            }
          />
          {product.reviews.length ? (
            <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {product.reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} locale={locale} dict={dict} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-muted">{dict.product.noReviews}</p>
          )}
        </Container>
      </Section>

      <JsonLd
        data={productJsonLd({
          name,
          description: localized(product, "shortDescription", locale),
          url,
          images: product.images.map((image) => absoluteUrl(siteUrl(), mediaUrl(image.key, 1600))),
          sku: product.id,
          category: categoryName,
          brand: settings.businessName,
          variants: product.variants,
          reviews: product.reviews,
        })}
      />
    </>
  );
}
