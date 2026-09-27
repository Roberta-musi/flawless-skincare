import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewForm, ReviewFormWithParams } from "@/components/forms/review-form";
import { ReviewCard } from "@/components/review/review-card";
import { PageHeader } from "@/components/site/page-header";
import { Container, Section } from "@/components/ui/layout";
import { Stars } from "@/components/ui/stars";
import { getCatalog } from "@/lib/data/catalog";
import { getApprovedReviews } from "@/lib/data/reviews";
import { getServices } from "@/lib/data/services";
import { interpolate, localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { ratingSummary } from "@/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  return pageMetadata({ locale, path: "/reviews", title: dict.reviews.title, description: dict.reviews.intro });
}

export default async function ReviewsPage() {
  const { locale, dict } = await getI18n();
  const [reviews, catalog, services] = await Promise.all([getApprovedReviews(), getCatalog(), getServices()]);
  const rating = ratingSummary(reviews);
  const formProps = {
    locale,
    dict: { reviews: dict.reviews, forms: dict.forms, common: dict.common, nav: dict.nav },
    products: catalog.products.map((p) => ({ value: `product:${p.slug}`, label: localized(p, "name", locale) })),
    services: services.map((s) => ({ value: `service:${s.slug}`, label: localized(s, "name", locale) })),
  };

  return (
    <>
      <PageHeader
        crumbs={[
          { label: dict.common.home, href: localePath(locale, "/") },
          { label: dict.reviews.title, href: localePath(locale, "/reviews") },
        ]}
        eyebrow={dict.home.reviewsEyebrow}
        title={dict.reviews.title}
        intro={dict.reviews.intro}
      >
        {rating && (
          <div className="flex items-center gap-3">
            <span className="font-display text-4xl">{rating.average}</span>
            <div className="flex flex-col gap-1">
              <Stars rating={Math.round(rating.average)} label={interpolate(dict.common.ratingLabel, { rating: rating.average })} />
              <span className="text-xs text-muted">
                {rating.count === 1 ? dict.product.reviewsCountOne : interpolate(dict.product.reviewsCount, { count: rating.count })}
              </span>
            </div>
          </div>
        )}
      </PageHeader>

      <Section className="pt-12 md:pt-16">
        <Container className="flex flex-col gap-10">
          <p className="flex items-start gap-3 rounded-2xl bg-lilac/50 p-5 text-sm leading-6 text-plum/80">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-fuchsia" strokeWidth={1.5} />
            {dict.reviews.verification}
          </p>
          {reviews.length ? (
            <ul className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>li]:mb-6 [&>li]:break-inside-avoid">
              {reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard
                    review={{
                      ...review,
                      product: review.product?.isPublished ? review.product : null,
                      service: review.service?.isPublished ? review.service : null,
                    }}
                    locale={locale}
                    dict={dict}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center font-display text-2xl text-muted">{dict.reviews.empty}</p>
          )}
        </Container>
      </Section>

      <Section id="write" className="scroll-mt-20 bg-cream/70">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl md:text-5xl">{dict.reviews.formTitle}</h2>
            <p className="leading-7 text-muted">{dict.reviews.formIntro}</p>
          </div>
          <Suspense fallback={<ReviewForm {...formProps} initialAbout="" />}>
            <ReviewFormWithParams {...formProps} />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
