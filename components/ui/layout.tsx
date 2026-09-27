import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10", className)} {...props} />;
}

export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("py-20 md:py-28", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-[11px] font-medium uppercase tracking-[0.3em] text-fuchsia", className)}
      {...props}
    />
  );
}

export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden>
      <span className="hairline w-16" />
      <Image src="/brand/butterfly-gold.png" alt="" width={240} height={246} className="h-5 w-auto opacity-90" />
      <span className="hairline w-16" />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  as: Heading = "h2",
  className,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
  action?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-4", centered && "items-center")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading className="text-4xl leading-[1.05] md:text-5xl">{title}</Heading>
        {intro && <p className="max-w-xl text-[15px] leading-7 text-muted md:text-base">{intro}</p>}
      </div>
      {action}
    </div>
  );
}
