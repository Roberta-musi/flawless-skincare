import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { BagDrawer } from "@/components/bag/bag-drawer";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { WhatsAppBubble } from "@/components/site/whatsapp-bubble";
import { getCatalog } from "@/lib/data/catalog";
import { getBrandProfile, getSettings } from "@/lib/data/site";
import { locales } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { businessWhatsAppUrl, siteUrl } from "@/lib/site";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#fbf6f2",
};

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: dict.meta.defaultTitle, template: `%s · ${dict.meta.siteName}` },
    description: dict.meta.defaultDescription,
    applicationName: dict.meta.siteName,
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, dict } = await getI18n();
  const [settings, brand, catalog] = await Promise.all([getSettings(), getBrandProfile(), getCatalog()]);
  const whatsapp = businessWhatsAppUrl(settings, dict.whatsapp.messages.general);

  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-plum px-5 py-3 text-sm text-ivory focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {dict.nav.skipToContent}
        </a>
        <Header locale={locale} dict={dict} settings={settings} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} dict={dict} settings={settings} categories={catalog.categories} />
        {whatsapp && <WhatsAppBubble href={whatsapp} label={dict.whatsapp.chat} />}
        <BagDrawer
          locale={locale}
          whatsappNumber={normalizeWhatsAppNumber(settings.whatsapp)}
          dict={{ bag: dict.bag, whatsapp: dict.whatsapp, common: dict.common, product: dict.product, nav: dict.nav }}
        />
        <SiteJsonLd settings={settings} brand={brand} catalog={catalog} description={dict.meta.defaultDescription} />
        <Toaster
          position="bottom-center"
          offset={{ bottom: 96 }}
          mobileOffset={{ bottom: 88, left: 16, right: 16 }}
          toastOptions={{
            classNames: {
              toast: "!rounded-2xl !border-line !bg-white !font-sans !text-plum !shadow-[0_20px_50px_-20px_rgb(43_20_49/0.35)]",
              actionButton: "!rounded-full !bg-plum !text-ivory !text-[11px] !uppercase !tracking-[0.14em]",
            },
          }}
        />
      </body>
    </html>
  );
}
