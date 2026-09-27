import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-xl border border-line bg-white px-4 text-[15px] text-plum placeholder:text-muted/60 transition-colors duration-200 hover:border-plum/30 focus:border-fuchsia focus:outline-none focus:ring-3 focus:ring-fuchsia/10 aria-invalid:border-danger aria-invalid:ring-danger/10 disabled:cursor-not-allowed disabled:opacity-60";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-[13px] font-medium text-plum", className)} {...props} />;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-32 py-3 leading-6", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        control,
        "h-12 appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath stroke='%232b1431' stroke-width='1.5' d='m1 1.5 5 5 5-5'/%3E%3C/svg%3E\")] bg-[position:right_1rem_center] bg-no-repeat pr-10",
        className,
      )}
      {...props}
    />
  );
}

export function Checkbox({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      className={cn("mt-0.5 size-4.5 shrink-0 cursor-pointer rounded accent-fuchsia", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  optionalLabel,
  className,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  optionalLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted">{optionalLabel}</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs leading-5 text-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs leading-5 text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
