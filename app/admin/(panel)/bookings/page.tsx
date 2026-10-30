import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, EmptyState, ListLink, StatusPill } from "@/components/admin/ui";
import { timeAgo } from "@/lib/admin-format";
import { describeSlot } from "@/lib/booking-replies";
import { cn } from "@/lib/cn";
import { type BookingStatus, listBookings } from "@/lib/data/admin/inbox";
import { bookingStatuses } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Bookings" };

const labels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Declined",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const requested = (await searchParams).status;
  const status = bookingStatuses.find((s) => s === requested) ?? null;
  const { rows, counts } = await listBookings(status);
  const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);

  return (
    <>
      <AdminHeader title="Bookings" description="Requests from the website. Nothing is booked until you confirm it with the customer on WhatsApp." />
      <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {[{ id: null, label: "All", n: total }, ...bookingStatuses.map((s) => ({ id: s, label: labels[s], n: counts[s] ?? 0 }))].map((tab) => (
          <Link
            key={tab.id ?? "all"}
            href={tab.id ? `/admin/bookings?status=${tab.id}` : "/admin/bookings"}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors",
              status === tab.id ? "bg-plum text-ivory" : "bg-white text-plum ring-1 ring-line hover:bg-cream",
            )}
          >
            {tab.label}
            <span className={cn("rounded-full px-1.5 text-[10px]", status === tab.id ? "bg-ivory/15" : "bg-cream")}>{tab.n}</span>
          </Link>
        ))}
      </div>
      {rows.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-line">
          {rows.map((booking) => (
            <li key={booking.id}>
              <ListLink href={`/admin/bookings/${booking.id}`} className="rounded-none px-4 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{booking.name}</p>
                  <p className="truncate text-sm text-muted">{booking.serviceName}</p>
                  <p className="truncate text-xs text-muted">{describeSlot(booking.preferredSlots[0], "en")}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusPill status={booking.status}>{labels[booking.status]}</StatusPill>
                  <span className="text-[11px] text-muted">{timeAgo(booking.createdAt)}</span>
                </div>
                <ChevronRight className="size-4 shrink-0 text-plum/30" />
              </ListLink>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No booking requests here" body="New requests from the website appear here and are emailed to you." />
      )}
    </>
  );
}
