import type { Metadata } from "next";
import Link from "next/link";
import { ReviewModeration } from "@/components/admin/review-moderation";
import { AdminHeader } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { getCatalogOptions } from "@/lib/data/admin/catalog";
import { listReviews } from "@/lib/data/admin/reviews";
import { listAdminServices } from "@/lib/data/admin/services";
import { reviewStatuses } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Reviews" };

const labels = { pending: "Waiting", approved: "Published", rejected: "Hidden" };

export default async function ReviewsAdminPage({ searchParams }: PageProps<"/admin/reviews">) {
  const params = await searchParams;
  const status = reviewStatuses.find((s) => s === params.status) ?? (params.highlight ? null : "pending");
  const [{ rows, counts }, options, services] = await Promise.all([listReviews(status), getCatalogOptions(), listAdminServices()]);
  const tabs = [...reviewStatuses.map((s) => ({ id: s, label: labels[s], n: counts[s] ?? 0 })), { id: "all", label: "All", n: Object.values(counts).reduce((a, b) => a + (b ?? 0), 0) }];

  return (
    <>
      <AdminHeader title="Reviews" description="Approve reviews before they appear on the website. Featured reviews show on the home page." />
      <div className="scrollbar-none -mx-4 mb-2 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/reviews?status=${tab.id}`}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors",
              (status ?? "all") === tab.id ? "bg-plum text-ivory" : "bg-white text-plum ring-1 ring-line hover:bg-cream",
            )}
          >
            {tab.label}
            <span className="rounded-full bg-cream/30 px-1.5 text-[10px]">{tab.n}</span>
          </Link>
        ))}
      </div>
      <ReviewModeration
        reviews={rows}
        highlight={typeof params.highlight === "string" ? params.highlight : null}
        options={{ products: options.products, services: services.map((s) => ({ id: s.id, nameEn: s.nameEn })) }}
      />
    </>
  );
}
