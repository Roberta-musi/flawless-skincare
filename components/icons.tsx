import { siFacebook, siInstagram, siTiktok, siWhatsapp } from "simple-icons";
import type { SVGProps } from "react";

function brandIcon(path: string) {
  return function BrandIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
        <path d={path} />
      </svg>
    );
  };
}

export const WhatsAppIcon = brandIcon(siWhatsapp.path);
export const FacebookIcon = brandIcon(siFacebook.path);
export const TikTokIcon = brandIcon(siTiktok.path);
export const InstagramIcon = brandIcon(siInstagram.path);
