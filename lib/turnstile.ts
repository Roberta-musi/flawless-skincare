import "server-only";

export async function verifyTurnstile(formData: FormData, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const token = formData.get("cf-turnstile-response");
  if (typeof token !== "string" || !token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const result = (await response.json()) as { success: boolean };
  return result.success;
}
