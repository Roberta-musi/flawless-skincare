import { Plus } from "lucide-react";
import type { ReactNode } from "react";

export function AccordionItem({ title, open, children }: { title: ReactNode; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[13px] font-medium tracking-[0.16em] text-plum uppercase">
        {title}
        <Plus className="size-4 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" strokeWidth={1.5} />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}
