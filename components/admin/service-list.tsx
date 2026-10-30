"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { setServicePublishedAction } from "@/lib/actions/admin/services";
import { formatDuration, formatPrice } from "@/lib/format";
import { EmptyState, StatusPill } from "./ui";

type Row = {
  id: string;
  nameEn: string;
  isPublished: boolean;
  imageKey: string | null;
  durationMinutes: number | null;
  priceXaf: number | null;
  priceType: "fixed" | "from" | "consultation";
};

export function ServiceList({ services }: { services: Row[] }) {
  const [pending, startTransition] = useTransition();
  if (!services.length) return <EmptyState title="No services yet" body="Add the treatments and consultations you offer." />;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-line">
      {services.map((service) => (
        <li key={service.id} className="flex items-center gap-3 pr-3">
          <Link href={`/admin/services/${service.id}`} className="flex min-w-0 flex-1 items-center gap-4 p-3 transition-colors hover:bg-cream/60 sm:px-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-blush">
              {service.imageKey && <Image src={service.imageKey} alt="" fill sizes="56px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{service.nameEn}</p>
              <p className="truncate text-xs text-muted">
                {service.durationMinutes ? formatDuration(service.durationMinutes, "en") : "No duration"} ·{" "}
                {service.priceType === "consultation"
                  ? "Price after consultation"
                  : service.priceXaf == null
                    ? "Price on request"
                    : `${service.priceType === "from" ? "From " : ""}${formatPrice(service.priceXaf, "en")}`}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-plum/30" />
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setServicePublishedAction(service.id, !service.isPublished);
                toast.success(service.isPublished ? `“${service.nameEn}” is now hidden.` : `“${service.nameEn}” is now on the website.`);
              })
            }
          >
            <StatusPill status={service.isPublished ? "published" : "draft"}>{service.isPublished ? "Live" : "Draft"}</StatusPill>
          </button>
        </li>
      ))}
    </ul>
  );
}
