"use client";

import {
  CalendarDays,
  CircleHelp,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tags,
  UserRound,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Sheet } from "@/components/site/sheet";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";

type Counts = { pendingBookings: number; pendingReviews: number; unreadMessages: number };
type User = { name: string; email: string; role: "owner" | "manager" };

const sections = [
  {
    label: "Daily",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays, badge: "pendingBookings" },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: "unreadMessages" },
      { href: "/admin/reviews", label: "Reviews", icon: Star, badge: "pendingReviews" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: ShoppingBag },
      { href: "/admin/taxonomy", label: "Categories & filters", icon: Tags },
      { href: "/admin/services", label: "Services", icon: Sparkles },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/profile", label: "Brand profile", icon: UserRound },
      { href: "/admin/settings", label: "Business settings", icon: Store },
      { href: "/admin/content", label: "FAQ & pages", icon: CircleHelp },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/admin/team", label: "Team", icon: UsersRound, ownerOnly: true },
      { href: "/admin/account", label: "My account", icon: UserRoundCog },
    ],
  },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function Badge({ value }: { value: number }) {
  if (!value) return null;
  return <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-fuchsia px-1.5 text-[10px] leading-5 font-semibold text-white">{value}</span>;
}

function NavList({ counts, role, dark, onNavigate }: { counts: Counts; role: User["role"]; dark?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-7" aria-label="Admin">
      {sections.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          <p className={cn("px-3 pb-1 text-[10px] font-medium tracking-[0.24em] uppercase", dark ? "text-gold-soft/80" : "text-gold")}>
            {section.label}
          </p>
          {section.items.map((item) => {
            if ("ownerOnly" in item && role !== "owner") return null;
            const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  dark
                    ? active
                      ? "bg-ivory/12 text-ivory"
                      : "text-ivory/70 hover:bg-ivory/8 hover:text-ivory"
                    : active
                      ? "bg-blush text-fuchsia-deep"
                      : "text-plum/80 hover:bg-cream",
                )}
              >
                <Icon className="size-4.5" strokeWidth={1.5} />
                {item.label}
                {"badge" in item && <Badge value={counts[item.badge]} />}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function AccountFooter({ user, dark, onNavigate }: { user: User; dark?: boolean; onNavigate?: () => void }) {
  return (
    <div className={cn("flex flex-col gap-3 border-t pt-5", dark ? "border-ivory/10" : "border-line")}>
      <Link
        href="/"
        target="_blank"
        className={cn("flex items-center gap-2 px-3 text-sm", dark ? "text-ivory/70 hover:text-ivory" : "text-plum/80 hover:text-plum")}
      >
        <ExternalLink className="size-4" strokeWidth={1.5} />
        View website
      </Link>
      <div className="flex items-center justify-between gap-2 px-3">
        <Link href="/admin/account" onClick={onNavigate} className="min-w-0" title="My account">
          <p className={cn("truncate text-sm font-medium", dark ? "text-ivory" : "text-plum")}>{user.name}</p>
          <p className={cn("truncate text-xs", dark ? "text-ivory/50" : "text-muted")}>{user.email}</p>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className={cn("grid size-9 place-items-center rounded-full", dark ? "text-ivory/70 hover:bg-ivory/10" : "text-muted hover:bg-cream")}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminSidebar({ counts, user }: { counts: Counts; user: User }) {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-8 overflow-y-auto bg-plum px-4 py-7 lg:flex">
      <Link href="/admin" className="px-3">
        <Logo light eager className="w-28 md:w-28" />
      </Link>
      <div className="flex-1">
        <NavList counts={counts} role={user.role} dark />
      </div>
      <AccountFooter user={user} dark />
    </aside>
  );
}

export function AdminMobileNav({ counts, user }: { counts: Counts; user: User }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const tabs = [
    { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true, badge: 0 },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarDays, badge: counts.pendingBookings },
    { href: "/admin/products", label: "Products", icon: ShoppingBag, badge: 0 },
    { href: "/admin/reviews", label: "Reviews", icon: Star, badge: counts.pendingReviews },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-ivory/90 px-4 backdrop-blur lg:hidden">
        <Link href="/admin">
          <Logo eager className="w-20 md:w-20" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative grid size-10 place-items-center rounded-full text-plum hover:bg-blush"
          aria-label="Open admin menu"
        >
          <Menu className="size-5" strokeWidth={1.5} />
          {counts.unreadMessages > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-fuchsia" />}
        </button>
      </header>
      <nav
        aria-label="Quick"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href, tab.exact);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn("relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium", active ? "text-fuchsia" : "text-muted")}
            >
              <Icon className="size-5" strokeWidth={1.5} />
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute top-1.5 left-[calc(50%+6px)] grid min-w-4 place-items-center rounded-full bg-fuchsia px-1 text-[9px] leading-4 text-white">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-muted">
          <Menu className="size-5" strokeWidth={1.5} />
          More
        </button>
      </nav>
      <Sheet open={open} onClose={() => setOpen(false)} side="left" label="Admin menu" closeLabel="Close menu" header={<Logo eager className="w-24 md:w-24" />}>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
          <div className="flex-1">
            <NavList counts={counts} role={user.role} onNavigate={() => setOpen(false)} />
          </div>
          <AccountFooter user={user} onNavigate={() => setOpen(false)} />
        </div>
      </Sheet>
    </>
  );
}
