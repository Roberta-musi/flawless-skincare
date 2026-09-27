import { cacheLife } from "next/cache";
import { interpolate } from "@/lib/i18n/localized";

export async function YearsOfCare({ since, template, className }: { since: number; template: string; className?: string }) {
  "use cache";
  cacheLife("days");
  const years = new Date().getUTCFullYear() - since;
  if (years < 1) return null;
  return <p className={className}>{interpolate(template, { years })}</p>;
}
