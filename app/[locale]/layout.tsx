import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { isLocale, locales } from "@/lib/i18n/config";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const lang = await locale();
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
