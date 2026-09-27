import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const tones = {
  fuchsia: "bg-fuchsia text-white",
  plum: "bg-plum text-ivory",
  blush: "bg-blush text-fuchsia-deep",
  ivory: "bg-ivory/95 text-plum",
  gold: "bg-gold-soft/40 text-plum",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  muted: "bg-plum/5 text-muted",
};

export function Badge({ tone = "blush", className, ...props }: ComponentProps<"span"> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
