import { CalendarHeart, Clock, MapPin, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { ProductImage } from "@/components/product/product-image";
import { ReviewCard } from "@/components/review/review-card";
import { ServiceCard } from "@/components/service/service-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/layout";
import { Prose } from "@/components/ui/prose";
import { getServiceBySlug, getServices } from "@/lib/data/services";
import { getSettings } from "@/lib/data/site";
import { interpolate, isTranslated, localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { ogImageUrl } from "@/lib/media/url";
import { pageMetadata } from "@/lib/seo";
import { serviceDurationLabel, servicePriceLabel } from "@/lib/services";
import { businessWhatsAppUrl, siteUrl } from "@/lib/site";
import { serviceJsonLd } from "@/lib/structured-data";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { locale } = await getI18n();
  const service = await getServiceBySlug((await params).slug);
  if (!service) return {};
  const name = localized(service, "name", locale);
  return pageMetadata({
    locale,
    path: `/services/${service.slug}`,
    title: localized(service, "seoTitle", locale) ?? name,
    description: localized(service, "seoDescription", locale) ?? localized(service, "shortDescription", locale),
    images: service.imageKey ? [{ url: ogImageUrl(service.imageKey), width: 1200, height: 630, alt: name }] : undefined,
    translated: isTranslated(service, ["name", "shortDescription", "description", "whatToExpect", "preparation", "aftercare"]),
  });
}

export default async function ServicePage({ params }: PageProps<"/[locale]/services/[slug]">) {
  const { locale, dict } = await getI18n();
  const service = await getServiceBySlug((await params).slug);
  if (!service) notFound();
  const [settings, services] = await Promise.all([getSettings(), getServices()]);

  const name = localized(service, "name", locale);
  const path = localePath(locale, `/services/${service.slug}`);
  const duration = serviceDurationLabel(service, locale);
  const whatsapp = businessWhatsAppUrl(settings, interpolate(dict.whatsapp.messages.service, { service: name }));
  const others = services.filter((s) => s.id !== service.id).slice(0, 3);
  const sections = [
    { title: dict.services.whatToExpect, body: localized(service, "whatToExpect", locale) },
    { title: dict.services.preparation, body: localized(service, "preparation", locale) },
    { title: dict.services.aftercare, body: localized(service, "aftercare", locale) },
  ].filter((s): s is { title: string; body: string } => Boolean(s.body?.trim()));

  const facts = [
    { icon: MapPin, label: dict.services.modes[service.mode] },
    duration && { icon: Clock, label: `${dict.services.duration}: ${duration}` },
    { icon: Wallet, label: `${dict.services.price}: ${servicePriceLabel(service, locale, dict.common)}` },
  ].filter((f): f is { icon: typeof MapPin; label: string } => Boolean(f));

  return (
    <>
      <Container className="pt-6 md:pt-8">
        <Breadcrumbs
          items={[
            { label: dict.common.home, href: localePath(locale, "/") },
            { label: dict.services.title, href: localePath(locale, "/services") },
            { label: name, href: path },
          ]}
        />
      </Container>

      <Container className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 pt-8 pb-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:pb-24">
        <ProductImage
          imageKey={service.imageKey}
          alt={name}
          sizes="(min-width: 1024px) 40vw, 100vw"
          priority
          className="aspect-[4/5] rounded-[12rem_12rem_1.5rem_1.5rem] w-full max-w-md justify-self-center lg:max-w-none"
        />
        <div className="flex animate-rise flex-col items-start gap-6">
          <Eyebrow>{dict.home.servicesEyebrow}</Eyebrow>
          <h1 className="text-5xl leading-[1.02] md:text-6xl">{name}</h1>
          {localized(service, "shortDescription", locale) && (
            <p className="text-lg leading-8 text-muted">{localized(service, "shortDescription", locale)}</p>
          )}
          <ul className="flex w-full flex-col divide-y divide-line border-y border-line">
            {facts.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 py-3 text-[15px]">
                <Icon className="size-4.5 text-gold" strokeWidth={1.5} />
                {label}
              </li>
            ))}
          </ul>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href={localePath(locale, `/book?service=${service.slug}`)} size="lg">
              <CalendarHeart />
              {dict.services.book}
            </ButtonLink>
            {whatsapp && (
              <ButtonAnchor href={whatsapp} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="lg">
                <WhatsAppIcon />
                {dict.whatsapp.ask}
              </ButtonAnchor>
            )}
          </div>
        </div>
      </Container>

      {(localized(service, "description", locale) || sections.length > 0) && (
        <Section className="bg-cream/70">
          <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <Prose source={localized(service, "description", locale)} className="text-base leading-8" />
            {sections.length > 0 && (
              <div className="flex flex-col gap-6">
                {sections.map((section, i) => (
                  <div key={section.title} className="rounded-[1.5rem] bg-white p-7 ring-1 ring-line">
                    <p className="mb-3 font-display text-4xl leading-none text-gold italic">{String(i + 1).padStart(2, "0")}</p>
                    <h2 className="mb-3 text-2xl">{section.title}</h2>
                    <Prose source={section.body} />
                  </div>
                ))}
              </div>
            )}
          </Container>
        </Section>
      )}

      {service.reviews.length > 0 && (
        <Section>
          <Container>
            <SectionHeading align="left" title={dict.product.reviews} />
            <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {service.reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} locale={locale} dict={dict} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {others.length > 0 && (
        <Section>
          <Container>
            <SectionHeading align="left" title={dict.services.otherServices} />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <li key={other.id}>
                  <ServiceCard service={other} locale={locale} dict={dict} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <JsonLd
        data={serviceJsonLd({
          name,
          description: localized(service, "shortDescription", locale),
          url: `${siteUrl()}${path}`,
          businessUrl: siteUrl(),
          city: settings.city,
          priceXaf: service.priceXaf,
          priceType: service.priceType,
        })}
      />
    </>
  );
}
