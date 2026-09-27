"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { interpolate } from "@/lib/i18n/localized";
import { ProductImage } from "./product-image";

export function ProductGallery({
  images,
  name,
  labels,
}: {
  images: { key: string; alt: string }[];
  name: string;
  labels: { gallery: string; showImage: string };
}) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  if (images.length <= 1) {
    return (
      <ProductImage
        imageKey={images[0]?.key}
        alt={images[0]?.alt ?? name}
        sizes="(min-width: 1024px) 50vw, 100vw"
        preload
        className="aspect-[4/5] rounded-[1.75rem]"
      />
    );
  }

  function show(index: number) {
    setActive(index);
    const el = track.current;
    if (el) el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse" aria-label={labels.gallery} role="group">
      <div className="relative min-w-0 flex-1">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.clientWidth);
            if (index !== active) setActive(index);
          }}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-[1.75rem]"
        >
          {images.map((image, i) => (
            <div key={image.key} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-blush">
              <Image src={image.key} alt={image.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" preload={i === 0} className="object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 lg:hidden">
          {images.map((image, i) => (
            <button
              key={image.key}
              type="button"
              onClick={() => show(i)}
              aria-label={interpolate(labels.showImage, { index: i + 1 })}
              aria-current={i === active}
              className={cn("h-1.5 rounded-full bg-ivory/70 transition-all", i === active ? "w-6 bg-ivory" : "w-1.5")}
            />
          ))}
        </div>
      </div>
      <div className="hidden w-20 shrink-0 flex-col gap-3 lg:flex">
        {images.map((image, i) => (
          <button
            key={image.key}
            type="button"
            onClick={() => show(i)}
            aria-label={interpolate(labels.showImage, { index: i + 1 })}
            aria-current={i === active}
            className={cn(
              "relative aspect-[4/5] overflow-hidden rounded-xl bg-blush ring-offset-2 ring-offset-ivory transition",
              i === active ? "ring-2 ring-plum" : "opacity-70 hover:opacity-100",
            )}
          >
            <Image src={image.key} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
