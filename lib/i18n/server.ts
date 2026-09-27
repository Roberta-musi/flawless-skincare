import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import { isLocale, type Locale } from "./config";
import en from "./dictionaries/en";
import fr from "./dictionaries/fr";

export const dictionaries = { en, fr };

export async function getLocale(): Promise<Locale> {
  const value = await localeParam();
  if (!value || !isLocale(value)) notFound();
  return value;
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, dict: dictionaries[locale] };
}
