import Image from "next/image";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

export function AuthShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-plum lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_30%,rgb(168_18_111/0.35)_0%,transparent_70%)]" />
        <div className="relative flex flex-col items-center gap-8 px-12 text-center text-ivory">
          <Logo light className="w-56 md:w-56" />
          <div className="hairline w-40" />
          <p className="max-w-sm font-display text-3xl leading-snug italic">The secret for a glowing skin</p>
          <Image src="/brand/butterfly-gold.png" unoptimized alt="" width={120} height={123} className="w-10 opacity-80" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center px-5 py-12 sm:px-8">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <Logo className="w-32 self-center lg:hidden" priority />
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium tracking-[0.3em] text-fuchsia uppercase">Flawless admin</p>
            <h1 className="text-4xl">{title}</h1>
            {intro && <p className="text-sm leading-6 text-muted">{intro}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
