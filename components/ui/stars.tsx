import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Stars({ rating, label, className }: { rating: number; label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-gold", className)} role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="size-3.5" strokeWidth={1.5} fill={i < rating ? "currentColor" : "none"} aria-hidden />
      ))}
    </span>
  );
}
