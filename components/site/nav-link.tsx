"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function NavLink({ href, className, exact, ...props }: ComponentProps<typeof Link> & { href: string; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative py-2 text-[12px] font-medium uppercase tracking-[0.14em] text-plum/80 transition-colors hover:text-plum xl:text-[13px]",
        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 after:ease-(--ease-soft) hover:after:scale-x-100",
        "aria-[current=page]:text-plum aria-[current=page]:after:scale-x-100",
        className,
      )}
      {...props}
    />
  );
}
