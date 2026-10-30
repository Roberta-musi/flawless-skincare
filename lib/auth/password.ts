// Web Crypto PBKDF2 keeps hashing native and fast on Cloudflare Workers, where 100,000 is the iteration ceiling.
const iterations = 100_000;

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

async function derive(password: string, salt: Uint8Array, rounds: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: rounds }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, iterations);
  return `pbkdf2:${iterations}:${toBase64(salt)}:${toBase64(hash)}`;
}

export async function verifyPassword({ hash, password }: { hash: string; password: string }) {
  const [scheme, rounds, salt, expected] = hash.split(":");
  if (scheme !== "pbkdf2" || !rounds || !salt || !expected) return false;
  const actual = await derive(password, fromBase64(salt), Number(rounds));
  const target = fromBase64(expected);
  if (actual.length !== target.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ target[i];
  return diff === 0;
}
