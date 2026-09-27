import { interpolate } from "@/lib/i18n/localized";

export function YearsOfCare({ since, template, className }: { since: number; template: string; className?: string }) {
  const years = new Date().getUTCFullYear() - since;
  if (years < 1) return null;
  return <p className={className}>{interpolate(template, { years })}</p>;
}
