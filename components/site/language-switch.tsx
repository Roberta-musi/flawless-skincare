"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { switchLocalePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/cn";

export function LanguageSwitch({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname();
  return (
    <div className={cn("flex items-center gap-1 text-[12px] font-medium tracking-[0.14em]", className)}>
      {(["en", "fr"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-plum/25" aria-hidden>/</span>}
          {l === locale ? (
            <span aria-current="true" className="px-1 text-plum">
              {l.toUpperCase()}
            </span>
          ) : (
            <Link
              href={switchLocalePath(pathname, l)}
              hrefLang={l}
              lang={l}
              className="px-1 text-plum/45 transition-colors hover:text-fuchsia"
              aria-label={l === "fr" ? "Français" : "English"}
            >
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
