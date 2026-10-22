/**
 * Pure helpers for the self-hosted demo access (WATERLINK_AUTH=code). No platform imports, so the
 * rules can be tested directly: the cookie carries its own expiry and is signed, and the server checks both.
 * The signing key is WATERLINK_COOKIE_SECRET when it is set (random and long, so a cookie cannot be turned into
 * the short access code by guessing offline); without it the access code itself is the key. Either way the code is
 * part of the signed message, so changing the code invalidates every cookie issued before.
 */
export const ACCESS_COOKIE = "wl_access";
export const ACCESS_USER = "demo-access-code";
export const ACCESS_MAX_AGE_S = 30 * 24 * 60 * 60;
const VERSION = "v2";
const encoder = new TextEncoder();

/** The configured code, or null when missing or too short to be meant seriously. */
export function usableCode(raw: string | undefined | null): string | null {
  const code = raw?.trim();
  return code && code.length >= 8 ? code : null;
}

/** Typed and configured codes compare without case and spaces. */
export function normalizeCode(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** What signs the cookies: the secret when there is one, else the access code itself. */
export interface Signing { code: string; secret?: string | null }

async function mac({ code, secret }: Signing, expiresAtS: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret ?? code), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const message = `waterlink-demo-access-${VERSION}.${expiresAtS}${secret ? `.${code}` : ""}`;
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** A cookie value that is valid until nowMs + ACCESS_MAX_AGE_S. */
export async function issueAccessToken(signing: Signing, nowMs: number): Promise<string> {
  const expiresAtS = Math.floor(nowMs / 1000) + ACCESS_MAX_AGE_S;
  return `${VERSION}.${expiresAtS}.${await mac(signing, expiresAtS)}`;
}

/** Valid only with the current code, before its expiry and never further ahead than issued. */
export async function verifyAccessToken(signing: Signing, token: string, nowMs: number): Promise<boolean> {
  const match = /^v2\.(\d{1,12})\.([0-9a-f]{64})$/.exec(token);
  if (!match) return false;
  const expiresAtS = Number(match[1]), nowS = Math.floor(nowMs / 1000);
  if (expiresAtS <= nowS || expiresAtS > nowS + ACCESS_MAX_AGE_S) return false;
  return constantTimeEqual(match[2], await mac(signing, expiresAtS));
}

export function readCookie(header: string | null, name: string): string {
  for (const part of (header ?? "").split(/;\s*/)) {
    if (part.startsWith(`${name}=`)) return part.slice(name.length + 1);
  }
  return "";
}

export function accessCookieHeader(token: string): string {
  return `${ACCESS_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${ACCESS_MAX_AGE_S}`;
}

/**
 * Who may change demo data. In code mode platform headers are ignored entirely, because on a
 * self-hosted worker any visitor could send them; only a valid access cookie counts.
 */
export async function resolveUserId(input: {
  mode: "sites" | "code";
  platformUserId: string | null;
  cookieHeader: string | null;
  code: string | null;
  secret?: string | null;
  nowMs: number;
}): Promise<string | null> {
  if (input.mode === "sites") return input.platformUserId;
  if (!input.code) return null;
  const token = readCookie(input.cookieHeader, ACCESS_COOKIE);
  return token && (await verifyAccessToken({ code: input.code, secret: input.secret }, token, input.nowMs)) ? ACCESS_USER : null;
}

/** Checks a typed code; returns the Set-Cookie header value on success. */
export async function redeemCode(code: string | null, typed: unknown, nowMs: number, secret?: string | null): Promise<string | null> {
  if (!code || typeof typed !== "string" || typed.length > 200) return null;
  if (!constantTimeEqual(normalizeCode(typed), normalizeCode(code))) return null;
  return accessCookieHeader(await issueAccessToken({ code, secret }, nowMs));
}
