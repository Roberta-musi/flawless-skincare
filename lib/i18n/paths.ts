import { defaultLocale, type Locale } from "./config";

export function localePath(locale: Locale, path: string) {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function stripLocale(pathname: string) {
  const match = pathname.match(/^\/fr(?=\/|$)/);
  if (!match) return pathname;
  return pathname.slice(match[0].length) || "/";
}

export function localeFromPathname(pathname: string): Locale {
  return /^\/fr(?=\/|$)/.test(pathname) ? "fr" : "en";
}

export function switchLocalePath(pathname: string, target: Locale) {
  return localePath(target, stripLocale(pathname));
}
