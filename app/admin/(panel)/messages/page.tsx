import type { Metadata } from "next";
import { MessageList } from "@/components/admin/message-list";
import { AdminHeader } from "@/components/admin/ui";
import { listMessages } from "@/lib/data/admin/inbox";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await listMessages();
  return (
    <>
      <AdminHeader title="Messages" description="Sent from the contact page. Reply on WhatsApp or by email." />
      <MessageList messages={messages} />
    </>
  );
}
