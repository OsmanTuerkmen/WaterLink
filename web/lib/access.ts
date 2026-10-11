import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

/**
 * Who may change demo data. On a Sites deployment the platform signs visitors in and sets
 * trusted headers. Self-hosted on Cloudflare (WATERLINK_AUTH=code) those headers could be
 * forged by any visitor, so they are ignored and only a cookie earned with the shared demo
 * access code counts. Reading the status never needs either.
 */
export type AuthMode = "sites" | "code";
export const ACCESS_COOKIE = "wl_access";
const ACCESS_USER = "demo-access-code";
const MAX_AGE_S = 30 * 24 * 60 * 60;

export function authMode(): AuthMode {
  return env.WATERLINK_AUTH === "code" ? "code" : "sites";
}

function accessCode(): string | null {
  const code = env.DEMO_ACCESS_CODE?.trim();
  return code && code.length >= 8 ? code : null;
}

async function sign(code: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("waterlink-demo-access-v1"));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, "0")).join("");
}

function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The stable user key for session and receipt checks, or null when not signed in. */
export async function currentUserId(): Promise<string | null> {
  if (authMode() === "sites") return (await getChatGPTUser())?.userId ?? null;
  const code = accessCode();
  if (!code) return null;
  const cookie = (await headers()).get("cookie") ?? "";
  const value = cookie.split(/;\s*/).find((c) => c.startsWith(`${ACCESS_COOKIE}=`))?.slice(ACCESS_COOKIE.length + 1) ?? "";
  return value && equal(value, await sign(code)) ? ACCESS_USER : null;
}

/** Checks a typed code; returns the Set-Cookie value on success. Comparison ignores case and spaces. */
export async function redeemAccessCode(typed: unknown): Promise<string | null> {
  const code = accessCode();
  if (authMode() !== "code" || !code || typeof typed !== "string") return null;
  const normal = (v: string) => v.trim().toLowerCase().replace(/\s+/g, "");
  if (!equal(normal(typed), normal(code))) return null;
  return `${ACCESS_COOKIE}=${await sign(code)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_S}`;
}
