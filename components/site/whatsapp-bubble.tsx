import { WhatsAppIcon } from "@/components/icons";

export function WhatsAppBubble({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group fixed right-4 bottom-4 z-30 flex h-14 items-center gap-3 rounded-full bg-whatsapp pr-4 pl-4 text-white shadow-[0_18px_40px_-16px_rgb(14_122_69/0.8)] transition-all duration-300 ease-(--ease-soft) hover:-translate-y-0.5 hover:bg-whatsapp-deep sm:right-6 sm:bottom-6 md:pr-6"
    >
      <WhatsAppIcon className="size-6" />
      <span className="hidden text-xs font-medium tracking-[0.14em] uppercase md:inline">{label}</span>
    </a>
  );
}
