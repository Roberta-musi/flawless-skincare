import type { Metadata } from "next";
import { WhatsAppIcon } from "@/components/icons";
import { ServiceCard } from "@/components/service/service-card";
import { PageHeader } from "@/components/site/page-header";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { getServices } from "@/lib/data/services";
import { getSettings } from "@/lib/data/site";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { businessWhatsAppUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  return pageMetadata({ locale, path: "/services", title: dict.services.title, description: dict.services.intro });
}

export default async function ServicesPage() {
  const { locale, dict } = await getI18n();
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  const whatsapp = businessWhatsAppUrl(settings, dict.whatsapp.messages.general);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: dict.common.home, href: localePath(locale, "/") },
          { label: dict.services.title, href: localePath(locale, "/services") },
        ]}
        eyebrow={dict.home.servicesEyebrow}
        title={dict.services.title}
        intro={dict.services.intro}
      />
      <Section className="pt-12 md:pt-16">
        <Container>
          {services.length ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <li key={service.id}>
                  <ServiceCard service={service} locale={locale} dict={dict} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted">{dict.services.empty}</p>
          )}
        </Container>
      </Section>
      <section className="bg-plum text-ivory">
        <Container className="flex flex-col items-center gap-6 py-16 text-center md:py-20">
          <h2 className="max-w-2xl text-4xl leading-tight md:text-5xl">{dict.product.advice}</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={localePath(locale, "/book")} variant="light">
              {dict.nav.book}
            </ButtonLink>
            {whatsapp && (
              <ButtonAnchor href={whatsapp} target="_blank" rel="noopener noreferrer" variant="outlineLight">
                <WhatsAppIcon />
                {dict.whatsapp.chat}
              </ButtonAnchor>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
