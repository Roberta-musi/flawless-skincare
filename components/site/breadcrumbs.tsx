import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/cn";
import { siteUrl } from "@/lib/site";

export type Crumb = { label: string; href: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("text-xs text-muted", className)}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3 text-plum/30" aria-hidden />}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-plum/80">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-fuchsia">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            item: `${siteUrl()}${item.href}`,
          })),
        }}
      />
    </>
  );
}
