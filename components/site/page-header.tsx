import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/layout";
import { cn } from "@/lib/cn";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  intro,
  className,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden border-b border-line/70", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_80%_at_100%_0%,var(--color-lilac)_0%,transparent_70%),radial-gradient(35%_70%_at_0%_100%,var(--color-blush)_0%,transparent_70%)] opacity-80"
      />
      <Container className="relative flex flex-col gap-5 py-10 md:py-14">
        <Breadcrumbs items={crumbs} />
        <div className="flex flex-col gap-4">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="animate-rise text-5xl leading-[1.02] md:text-6xl">{title}</h1>
          {intro && <div className="max-w-2xl text-base leading-7 text-muted md:text-lg md:leading-8">{intro}</div>}
        </div>
        {children}
      </Container>
    </div>
  );
}
