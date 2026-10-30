import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-fuchsia text-white shadow-[0_10px_30px_-14px_rgb(168_18_111/0.7)] hover:bg-fuchsia-deep hover:shadow-[0_14px_34px_-14px_rgb(138_14_91/0.8)]",
  secondary: "border border-plum/25 bg-transparent text-plum hover:border-plum hover:bg-plum hover:text-ivory",
  ghost: "text-plum hover:bg-blush",
  whatsapp: "bg-whatsapp text-white shadow-[0_10px_30px_-14px_rgb(14_122_69/0.7)] hover:bg-whatsapp-deep",
  light: "bg-ivory text-plum hover:bg-white",
  outlineLight: "border border-ivory/40 text-ivory hover:border-ivory hover:bg-ivory hover:text-plum",
};

const sizes = {
  sm: "min-h-9 px-4 py-2 text-[11px]",
  md: "min-h-11 px-6 py-2.5 text-xs",
  lg: "min-h-13 px-7 py-3 text-[13px]",
  icon: "size-11 text-xs",
};

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

type Styling = { variant?: ButtonVariant; size?: ButtonSize };

export function buttonClasses({ variant = "primary", size = "md" }: Styling = {}, className?: string) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-full text-center leading-tight font-medium uppercase tracking-[0.14em] transition-all duration-300 ease-(--ease-soft) active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & Styling) {
  return <button type={type} className={buttonClasses({ variant, size }, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & Styling) {
  return <Link className={buttonClasses({ variant, size }, className)} {...props} />;
}

export function ButtonAnchor({ variant, size, className, ...props }: ComponentProps<"a"> & Styling) {
  return <a className={buttonClasses({ variant, size }, className)} {...props} />;
}
