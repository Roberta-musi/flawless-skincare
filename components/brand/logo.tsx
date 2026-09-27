import Image from "next/image";
import { cn } from "@/lib/cn";

export function Logo({ light, className, priority }: { light?: boolean; className?: string; priority?: boolean }) {
  return (
    <Image
      src={light ? "/brand/logo-light.png" : "/brand/logo.png"}
      alt="Flawless Skin Care"
      width={720}
      height={415}
      priority={priority}
      className={cn("h-auto w-32 md:w-36", className)}
    />
  );
}
