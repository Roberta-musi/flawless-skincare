"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { deleteBooking, deleteMessage, setMessageRead, updateBooking } from "@/lib/data/admin/inbox";
import { bookingStatuses } from "@/lib/db/schema";

const bookingUpdate = z.object({
  status: z.enum(bookingStatuses),
  scheduledAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    .nullable(),
  adminNote: z.string().trim().max(2000).nullable(),
});

export async function updateBookingAction(id: string, payload: unknown) {
  const parsed = bookingUpdate.safeParse(payload);
  if (!parsed.success) return { ok: false as const };
  const { status, scheduledAt, adminNote } = parsed.data;
  // Cameroon is UTC+1 all year, so the admin's local time converts with a fixed offset.
  await updateBooking(id, { status, scheduledAt: scheduledAt ? new Date(`${scheduledAt}:00+01:00`) : null, adminNote: adminNote || null });
  return { ok: true as const };
}

export async function deleteBookingAction(id: string) {
  await deleteBooking(id);
  redirect("/admin/bookings");
}

export async function setMessageReadAction(id: string, isRead: boolean) {
  await setMessageRead(id, isRead);
}

export async function deleteMessageAction(id: string) {
  await deleteMessage(id);
}
