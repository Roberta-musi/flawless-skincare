import "server-only";

export type Email = { to: string; subject: string; text: string; html?: string; replyTo?: string };

export async function sendEmail(email: Email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email] RESEND_API_KEY not set; would send "${email.subject}" to ${email.to}\n${email.text}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Flawless Skin Care <onboarding@resend.dev>",
      to: [email.to],
      subject: email.subject,
      text: email.text,
      html: email.html,
      reply_to: email.replyTo,
    }),
  });
  if (!response.ok) console.error(`[email] Resend responded ${response.status}: ${await response.text()}`);
}

export function notificationRecipient(settingsEmail: string | null) {
  return process.env.NOTIFY_EMAIL ?? settingsEmail;
}
