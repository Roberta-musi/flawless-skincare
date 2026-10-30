import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function FormSuccess({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="flex animate-rise flex-col items-center gap-5 rounded-[2rem] bg-white px-6 py-12 text-center ring-1 ring-line" role="status">
      <span className="grid size-14 place-items-center rounded-full bg-blush text-fuchsia">
        <Check className="size-6" strokeWidth={1.75} />
      </span>
      <h2 className="text-3xl">{title}</h2>
      <p className="max-w-md leading-7 text-muted">{body}</p>
      {children}
    </div>
  );
}
