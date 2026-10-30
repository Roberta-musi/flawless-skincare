import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContactForm } from "@/components/forms/contact-form";
import { WhatsAppIcon } from "@/components/icons";
import { ProductImage } from "@/components/product/product-image";
import { PageHeader } from "@/components/site/page-header";
import { ButtonAnchor } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { getSettings } from "@/lib/data/site";
import { dayRange, groupOpeningHours } from "@/lib/hours";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { addressLines, businessWhatsAppUrl, directionsUrl, mapEmbedUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  return pageMetadata({ locale, path: "/contact", title: dict.contact.title, description: dict.contact.intro });
}

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 py-5">
      <span className="mt-0.5 text-gold">{icon}</span>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-medium tracking-[0.24em] text-muted uppercase">{label}</p>
        <div className="text-[15px] leading-7 text-plum">{children}</div>
      </div>
    </div>
  );
}

export default async function ContactPage() {
  const { locale, dict } = await getI18n();
  const settings = await getSettings();
  const hours = groupOpeningHours(settings.openingHours);
  const whatsapp = businessWhatsAppUrl(settings, dict.whatsapp.messages.general);
  const icon = "size-5";

  return (
    <>
      <PageHeader
        crumbs={[
          { label: dict.common.home, href: localePath(locale, "/") },
          { label: dict.contact.title, href: localePath(locale, "/contact") },
        ]}
        eyebrow={dict.home.visitEyebrow}
        title={dict.contact.title}
        intro={dict.contact.intro}
      />

      <Section className="pt-12 md:pt-16">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="flex flex-col">
            <div className="divide-y divide-line border-y border-line">
              <InfoRow icon={<MapPin className={icon} strokeWidth={1.5} />} label={dict.contact.address}>
                <address className="not-italic">
                  <span className="block font-medium">{settings.businessName}</span>
                  {addressLines(settings, locale).map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <a
                  href={directionsUrl(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-fuchsia hover:underline"
                >
                  <Navigation className="size-3.5" />
                  {dict.contact.directions}
                </a>
              </InfoRow>
              {settings.phone && (
                <InfoRow icon={<Phone className={icon} strokeWidth={1.5} />} label={dict.contact.phone}>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-fuchsia">
                    {settings.phone}
                  </a>
                </InfoRow>
              )}
              {settings.email && (
                <InfoRow icon={<Mail className={icon} strokeWidth={1.5} />} label={dict.contact.email}>
                  <a href={`mailto:${settings.email}`} className="break-all hover:text-fuchsia">
                    {settings.email}
                  </a>
                </InfoRow>
              )}
              {hours.length > 0 && (
                <InfoRow icon={<Clock className={icon} strokeWidth={1.5} />} label={dict.contact.hours}>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                    {hours.map((group) => (
                      <div key={group.from} className="contents">
                        <dt className="text-muted">{dayRange(group, dict.days, false)}</dt>
                        <dd className="tabular-nums">{"closed" in group ? dict.footer.closed : `${group.opens} – ${group.closes}`}</dd>
                      </div>
                    ))}
                  </dl>
                </InfoRow>
              )}
            </div>
            {whatsapp && (
              <ButtonAnchor href={whatsapp} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="lg" className="mt-8 self-stretch sm:self-start">
                <WhatsAppIcon />
                {dict.whatsapp.chat}
              </ButtonAnchor>
            )}
          </div>
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-[2rem] ring-1 ring-line">
              <iframe
                title={dict.contact.mapTitle}
                src={mapEmbedUrl(settings, locale)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[4/3] w-full border-0 grayscale-[35%] sepia-[10%]"
              />
            </div>
            {settings.shopPhotoKey && (
              <ProductImage imageKey={settings.shopPhotoKey} alt={dict.home.visitTitle} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[16/9] rounded-[2rem]" />
            )}
          </div>
        </Container>
      </Section>

      <Section className="bg-cream/70">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl md:text-5xl">{dict.contact.formTitle}</h2>
            <p className="leading-7 text-muted">{dict.contact.formIntro}</p>
          </div>
          <ContactForm locale={locale} dict={{ contact: dict.contact, forms: dict.forms, common: dict.common, booking: dict.booking }} />
        </Container>
      </Section>
    </>
  );
}
