// Signs and verifies a simple session cookie for /admin, using Web
// Crypto's HMAC (crypto.subtle) — this works identically in Node.js
// (Server Actions) and the Edge runtime (middleware.js), so signing
// and verifying always agree, and there's no dependency on any
// external auth service. Works the same on Vercel or a plain VPS.

export const COOKIE_NAME = "phoenix_admin_session";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "phoenix-fallback-secret";
}

async function hmac(value, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken() {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  const signature = await hmac(payload, getSecret());
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = await hmac(payload, getSecret());
  if (expected !== signature) return false;
  const expires = Number(payload);
  if (!expires || Date.now() > expires) return false;
  return true;
}

// ---------- Login attempt rate-limiting ----------
// A signed cookie tracks failed login attempts so a script can't just
// hammer the password field. No database needed — the count and
// window start are encoded right into the (tamper-proof) cookie value.
export const ATTEMPTS_COOKIE_NAME = "phoenix_admin_attempts";
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const MAX_ATTEMPTS = 5;

export async function createAttemptToken(count, windowStart) {
  const payload = `${count}.${windowStart}`;
  const signature = await hmac(payload, getSecret());
  return `${payload}.${signature}`;
}

export async function verifyAttemptToken(token) {
  if (!token) return { count: 0, windowStart: Date.now() };
  const parts = token.split(".");
  if (parts.length !== 3) return { count: 0, windowStart: Date.now() };
  const [countStr, windowStartStr, signature] = parts;
  const expected = await hmac(`${countStr}.${windowStartStr}`, getSecret());
  if (expected !== signature) return { count: 0, windowStart: Date.now() };

  const count = Number(countStr);
  const windowStart = Number(windowStartStr);
  if (!windowStart || Date.now() - windowStart > ATTEMPT_WINDOW_MS) {
    // Window expired — treat as a fresh start.
    return { count: 0, windowStart: Date.now() };
  }
  return { count, windowStart };
}
