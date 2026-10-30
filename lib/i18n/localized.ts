import type { Locale } from "./config";

type Localizable<F extends string> = { [K in `${F}En`]: unknown } & { [K in `${F}Fr`]?: unknown };

type EnValue<R, F extends string> = R extends Record<`${F}En`, infer V> ? V : never;

function isFilled(value: unknown) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function localized<F extends string, R extends Localizable<F>>(row: R, field: F, locale: Locale): EnValue<R, F> {
  const record = row as Record<string, unknown>;
  const fr = record[`${field}Fr`];
  if (locale === "fr" && isFilled(fr)) return fr as EnValue<R, F>;
  return record[`${field}En`] as EnValue<R, F>;
}

export function isTranslated(row: object, fields: string[]) {
  const record = row as Record<string, unknown>;
  return fields.every((field) => !isFilled(record[`${field}En`]) || isFilled(record[`${field}Fr`]));
}

export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
