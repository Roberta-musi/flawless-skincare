import { CalendarDays, ChevronRight, Clock3, ExternalLink, MessageSquare, Plus, ShoppingBag, Star, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { AdminHeader, Card, EmptyState, ListLink, StatusPill } from "@/components/admin/ui";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { greeting, timeAgo } from "@/lib/admin-format";
import { requireAdmin } from "@/lib/auth";
import { getAdminCounts, getDashboard } from "@/lib/data/admin/dashboard";
import { formatDate } from "@/lib/format";

export default async function DashboardPage() {
  const { user } = await requireAdmin();
  const [counts, { recentBookings, pendingReviews, recentMessages }] = await Promise.all([getAdminCounts(), getDashboard()]);
  const stats = [
    { href: "/admin/bookings?status=pending", label: "Booking requests to answer", value: counts.pendingBookings, icon: CalendarDays },
    { href: "/admin/reviews?status=pending", label: "Reviews to approve", value: counts.pendingReviews, icon: Star },
    { href: "/admin/messages", label: "Unread messages", value: counts.unreadMessages, icon: MessageSquare },
    { href: "/admin/products", label: "Products on the website", value: counts.publishedProducts, icon: ShoppingBag },
  ];

  return (
    <>
      <AdminHeader
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description="Here is what's waiting for you. Everything you change here updates the website straight away."
        actions={
          <>
            <ButtonAnchor href="/" target="_blank" variant="secondary" size="sm">
              <ExternalLink />
              View website
            </ButtonAnchor>
            <ButtonLink href="/admin/products/new" size="sm">
              <Plus />
              Add product
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ href, label, value, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col justify-between gap-6 rounded-[1.5rem] bg-white p-5 ring-1 ring-line transition-shadow hover:shadow-[0_20px_40px_-24px_rgb(43_20_49/0.3)]"
          >
            <Icon className="size-5 text-gold" strokeWidth={1.5} />
            <div>
              <p className="font-display text-5xl leading-none">{value}</p>
              <p className="mt-2 text-xs leading-5 text-muted">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card
          title="Latest booking requests"
          actions={
            <Link href="/admin/bookings" className="text-sm text-fuchsia hover:underline">
              All bookings
            </Link>
          }
        >
          {recentBookings.length ? (
            <ul className="-mx-4 flex flex-col">
              {recentBookings.map((booking) => (
                <li key={booking.id}>
                  <ListLink href={`/admin/bookings/${booking.id}`}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{booking.name}</p>
                      <p className="truncate text-sm text-muted">
                        {booking.serviceName} · {formatDate(booking.preferredSlots[0].date, "en", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusPill status={booking.status} />
                      <span className="text-[11px] text-muted">{timeAgo(booking.createdAt)}</span>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-plum/30" />
                  </ListLink>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No booking requests yet" body="Requests made on the website will appear here." />
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card
            title="Reviews waiting"
            actions={
              <Link href="/admin/reviews" className="text-sm text-fuchsia hover:underline">
                Moderate
              </Link>
            }
          >
            {pendingReviews.length ? (
              <ul className="flex flex-col gap-4">
                {pendingReviews.map((review) => (
                  <li key={review.id} className="flex flex-col gap-1.5 rounded-2xl bg-cream/70 p-4">
                    {review.rating != null && <Stars rating={review.rating} label={`${review.rating} out of 5`} />}
                    <p className="line-clamp-2 text-sm leading-6">“{review.body}”</p>
                    <p className="text-xs text-muted">
                      {review.name} · {timeAgo(review.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Nothing to approve right now.</p>
            )}
          </Card>
          <Card
            title="New messages"
            actions={
              <Link href="/admin/messages" className="text-sm text-fuchsia hover:underline">
                Inbox
              </Link>
            }
          >
            {recentMessages.length ? (
              <ul className="-mx-4 flex flex-col">
                {recentMessages.map((message) => (
                  <li key={message.id}>
                    <ListLink href={`/admin/messages#${message.id}`}>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{message.name}</p>
                        <p className="truncate text-sm text-muted">{message.subject ?? message.body}</p>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        <Clock3 className="size-3" />
                        {timeAgo(message.createdAt)}
                      </span>
                    </ListLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No unread messages.</p>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/admin/settings", label: "Update hours & contact details", icon: Store },
          { href: "/admin/profile", label: "Change your photo & story", icon: UserRound },
          { href: "/admin/services/new", label: "Add a service", icon: Plus },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl bg-lilac/50 px-5 py-4 text-sm transition-colors hover:bg-lilac">
            <Icon className="size-4.5 text-fuchsia" strokeWidth={1.5} />
            {label}
            <ChevronRight className="ml-auto size-4 text-plum/30" />
          </Link>
        ))}
      </div>
    </>
  );
}
