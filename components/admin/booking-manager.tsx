"use client";

import { Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/icons";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { deleteBookingAction, updateBookingAction } from "@/lib/actions/admin/inbox";
import { bookingReplyUrl } from "@/lib/booking-replies";
import { cn } from "@/lib/cn";
import type { AdminBooking } from "@/lib/data/admin/inbox";
import { Card } from "./ui";

const statuses = [
  { id: "pending", label: "Pending", tone: "bg-gold-soft/40" },
  { id: "confirmed", label: "Confirmed", tone: "bg-success/15 text-success" },
  { id: "rejected", label: "Declined", tone: "bg-danger/10 text-danger" },
  { id: "completed", label: "Completed", tone: "bg-plum/10" },
  { id: "cancelled", label: "Cancelled", tone: "bg-plum/5 text-muted" },
] as const;

function toLocalInput(date: Date | null) {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Douala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function BookingManager({ booking }: { booking: AdminBooking }) {
  const router = useRouter();
  const [status, setStatus] = useState(booking.status);
  const [scheduledAt, setScheduledAt] = useState(toLocalInput(booking.scheduledAt));
  const [note, setNote] = useState(booking.adminNote ?? "");
  const [saving, startSaving] = useTransition();
  const scheduled = scheduledAt ? new Date(`${scheduledAt}:00+01:00`) : null;
  const replyBase = { ...booking, scheduledAt: scheduled };
  const phoneDigits = booking.phone.replace(/[^\d+]/g, "");

  function save(next = status) {
    startSaving(async () => {
      const result = await updateBookingAction(booking.id, { status: next, scheduledAt: scheduledAt || null, adminNote: note });
      if (!result.ok) {
        toast.error("Could not save. Check the appointment time.");
        return;
      }
      toast.success("Booking updated.");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <Card title="Reply on WhatsApp" description={`Messages are written in ${booking.locale === "fr" ? "French" : "English"}, the language the customer used.`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonAnchor href={bookingReplyUrl(replyBase, "confirm") ?? "#"} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="sm">
              <WhatsAppIcon />
              Send confirmation
            </ButtonAnchor>
            <ButtonAnchor href={bookingReplyUrl(replyBase, "decline") ?? "#"} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
              <MessageCircle />
              Suggest another day
            </ButtonAnchor>
            <ButtonAnchor href={bookingReplyUrl(replyBase, "general") ?? "#"} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm">
              <MessageCircle />
              Open chat
            </ButtonAnchor>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            Tip: set the appointment time below first, so the confirmation includes it. Then mark the booking as confirmed.
          </p>
        </Card>

        <Card title="Status">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Booking status">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={status === s.id}
                  onClick={() => setStatus(s.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-all",
                    status === s.id ? cn(s.tone, "font-medium ring-2 ring-plum") : "bg-white ring-1 ring-line hover:bg-cream",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Field label="Appointment date and time" htmlFor="scheduled" hint="Cameroon time. Leave empty until agreed with the customer." optional optionalLabel="Optional">
              <Input id="scheduled" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </Field>
            <Field label="Private note" htmlFor="note" hint="Only visible here." optional optionalLabel="Optional">
              <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </Field>
            <Button onClick={() => save()} disabled={saving} className="self-start">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card title="Contact">
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-3">
              <Phone className="size-4 text-gold" />
              <a href={`tel:${phoneDigits}`} className="hover:text-fuchsia">
                {booking.phone}
              </a>
            </li>
            {booking.email && (
              <li className="flex items-center gap-3">
                <Mail className="size-4 text-gold" />
                <a href={`mailto:${booking.email}`} className="break-all hover:text-fuchsia">
                  {booking.email}
                </a>
              </li>
            )}
          </ul>
        </Card>
        <Card title="Delete request" description="Use this if the customer asks you to remove their details.">
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-danger/10"
            onClick={() => {
              if (confirm("Delete this booking request and the customer's details?")) startSaving(() => deleteBookingAction(booking.id));
            }}
          >
            <Trash2 />
            Delete
          </Button>
        </Card>
      </div>
    </div>
  );
}
