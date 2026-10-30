import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingManager } from "@/components/admin/booking-manager";
import { AdminHeader, Card, StatusPill } from "@/components/admin/ui";
import { timeAgo } from "@/lib/admin-format";
import { describeSlot } from "@/lib/booking-replies";
import { getBooking } from "@/lib/data/admin/inbox";

export const metadata: Metadata = { title: "Booking request" };

export default async function BookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
  const booking = await getBooking((await params).id);
  if (!booking) notFound();

  return (
    <>
      <AdminHeader
        title={booking.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusPill status={booking.status} />
            Requested {timeAgo(booking.createdAt)} · {booking.firstVisit ? "First visit" : "Returning customer"}
          </span>
        }
        back={{ href: "/admin/bookings", label: "Bookings" }}
      />
      <Card title={booking.serviceName} className="mb-6" actions={booking.service ? <Link href={`/services/${booking.service.slug}`} target="_blank" className="text-sm text-fuchsia hover:underline">View service</Link> : undefined}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-[0.2em] text-gold-deep uppercase">Preferred times</p>
            <ol className="flex flex-col gap-1.5 text-[15px]">
              {booking.preferredSlots.map((slot, i) => (
                <li key={i}>
                  <span className="mr-2 text-muted">{i + 1}.</span>
                  {describeSlot(slot, "en")}
                </li>
              ))}
            </ol>
          </div>
          {booking.notes && (
            <div>
              <p className="mb-2 text-[11px] font-medium tracking-[0.2em] text-gold-deep uppercase">Customer notes</p>
              <p className="text-[15px] leading-7 whitespace-pre-line">{booking.notes}</p>
            </div>
          )}
        </div>
      </Card>
      <BookingManager key={booking.updatedAt.getTime()} booking={booking} />
    </>
  );
}
