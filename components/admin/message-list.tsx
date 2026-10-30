"use client";

import { Mail, MailOpen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { ButtonAnchor } from "@/components/ui/button";
import { deleteMessageAction, setMessageReadAction } from "@/lib/actions/admin/inbox";
import { timeAgo } from "@/lib/admin-format";
import { cn } from "@/lib/cn";
import { toInternationalPhone, whatsappUrl } from "@/lib/whatsapp";
import { EmptyState, StatusPill } from "./ui";

type Message = { id: string; name: string; contact: string; subject: string | null; body: string; isRead: boolean; createdAt: Date; locale: "en" | "fr" };

function replyLinks(message: Message) {
  const email = /\S+@\S+\.\S+/.test(message.contact) ? message.contact.trim() : null;
  const phone = email ? null : toInternationalPhone("237", message.contact);
  const greeting = message.locale === "fr" ? `Bonjour ${message.name.split(" ")[0]}, ici Flawless Skin Care.` : `Hello ${message.name.split(" ")[0]}, this is Flawless Skin Care.`;
  return {
    email: email ? `mailto:${email}?subject=${encodeURIComponent(`Re: ${message.subject ?? "Your message"}`)}` : null,
    whatsapp: phone ? whatsappUrl(phone.slice(1), greeting) : null,
  };
}

export function MessageList({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!messages.length) return <EmptyState title="No messages yet" body="Messages sent from the contact page appear here and are emailed to you." />;

  const act = (fn: () => Promise<void>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <ul className="flex flex-col gap-3">
      {messages.map((message) => {
        const links = replyLinks(message);
        return (
          <li key={message.id} id={message.id} className={cn("scroll-mt-24 rounded-[1.5rem] bg-white p-5 ring-1 ring-line sm:p-6", !message.isRead && "ring-2 ring-fuchsia/30")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">
                  {message.name} <span className="font-normal text-muted">· {message.contact}</span>
                </p>
                <p className="text-xs text-muted">
                  {timeAgo(message.createdAt)}
                  {message.subject && ` · ${message.subject}`}
                </p>
              </div>
              {!message.isRead && <StatusPill status="unread">New</StatusPill>}
            </div>
            <p className="mt-4 text-[15px] leading-7 whitespace-pre-line">{message.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {links.whatsapp && (
                <ButtonAnchor href={links.whatsapp} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="sm" onClick={() => !message.isRead && act(() => setMessageReadAction(message.id, true))}>
                  <WhatsAppIcon />
                  Reply on WhatsApp
                </ButtonAnchor>
              )}
              {links.email && (
                <ButtonAnchor href={links.email} variant="secondary" size="sm" onClick={() => !message.isRead && act(() => setMessageReadAction(message.id, true))}>
                  <Mail />
                  Reply by email
                </ButtonAnchor>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => act(() => setMessageReadAction(message.id, !message.isRead))}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-xs text-plum hover:bg-cream"
              >
                <MailOpen className="size-4" />
                {message.isRead ? "Mark as unread" : "Mark as read"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => confirm("Delete this message?") && act(() => deleteMessageAction(message.id))}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-xs text-danger hover:bg-danger/10"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
