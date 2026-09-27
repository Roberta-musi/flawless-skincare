import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AdminHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        {back && (
          <Link href={back.href} className="flex items-center gap-1.5 self-start text-sm text-muted hover:text-plum">
            <ArrowLeft className="size-4" />
            {back.label}
          </Link>
        )}
        <h1 className="text-4xl leading-tight md:text-5xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-[1.5rem] bg-white p-5 ring-1 ring-line sm:p-7", className)}>
      {(title || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-2xl leading-tight">{title}</h2>}
            {description && <p className="text-sm leading-6 text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const pillTones = {
  pending: "bg-gold-soft/35 text-plum",
  confirmed: "bg-success/12 text-success",
  approved: "bg-success/12 text-success",
  published: "bg-success/12 text-success",
  completed: "bg-plum/10 text-plum",
  rejected: "bg-danger/10 text-danger",
  cancelled: "bg-plum/5 text-muted",
  draft: "bg-plum/5 text-muted",
  unread: "bg-fuchsia/10 text-fuchsia",
};

export function StatusPill({ status, children }: { status: keyof typeof pillTones; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize", pillTones[status])}>
      {children ?? status}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[1.5rem] border border-dashed border-line px-6 py-12 text-center">
      <p className="font-display text-2xl">{title}</p>
      {body && <p className="max-w-sm text-sm leading-6 text-muted">{body}</p>}
      {action}
    </div>
  );
}

export function ListLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn("flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-colors hover:bg-cream/80 focus-visible:bg-cream/80", className)}
      {...props}
    />
  );
}
