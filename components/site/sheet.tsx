"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export function Sheet({
  open,
  onClose,
  side,
  label,
  closeLabel,
  header,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  side: "left" | "right";
  label: string;
  closeLabel: string;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn("sheet", side === "left" ? "sheet-left" : "sheet-right", className)}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          {header}
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 grid size-10 place-items-center rounded-full text-plum transition-colors hover:bg-blush"
            aria-label={closeLabel}
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
