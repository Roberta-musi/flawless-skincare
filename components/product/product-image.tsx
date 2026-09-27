import Image from "next/image";
import { cn } from "@/lib/cn";

export function ProductImage({
  imageKey,
  alt,
  sizes,
  priority,
  className,
  imageClassName,
}: {
  imageKey: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-blush", className)}>
      {imageKey ? (
        <Image
          src={imageKey}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--color-lilac)_0%,var(--color-blush)_55%,var(--color-blush-deep)_100%)]">
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <Image src="/brand/butterfly-gold.png" alt="" width={240} height={246} className="h-10 w-auto opacity-80" />
            <span className="font-display text-lg leading-tight text-plum/70 italic">{alt}</span>
          </div>
        </div>
      )}
    </div>
  );
}
