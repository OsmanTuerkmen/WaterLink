import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { redeemCode, resolveUserId, usableCode } from "./access-token";

/**
 * Who may change demo data. On a Sites deployment the platform signs visitors in and sets
 * trusted headers. Self-hosted on Cloudflare (WATERLINK_AUTH=code) those headers could be
 * forged by any visitor, so they are ignored and only a signed, unexpired cookie earned with
 * the shared demo access code counts. Reading the status never needs either.
 * The rules themselves live in access-token.ts and access-limit.ts, where they are tested.
 */
export type AuthMode = "sites" | "code";
export { ACCESS_COOKIE } from "./access-token";

export function authMode(): AuthMode {
  return env.WATERLINK_AUTH === "code" ? "code" : "sites";
}

/** The stable user key for session and receipt checks, or null when not signed in. */
export async function currentUserId(): Promise<string | null> {
  const mode = authMode();
  return resolveUserId({
    mode,
    platformUserId: mode === "sites" ? (await getChatGPTUser())?.userId ?? null : null,
    cookieHeader: (await headers()).get("cookie"),
    code: usableCode(env.DEMO_ACCESS_CODE),
    secret: usableCode(env.WATERLINK_COOKIE_SECRET),
    nowMs: Date.now(),
  });
}

/** Checks a typed code; returns the Set-Cookie value on success. Comparison ignores case and spaces. */
export async function redeemAccessCode(typed: unknown): Promise<string | null> {
  if (authMode() !== "code") return null;
  return redeemCode(usableCode(env.DEMO_ACCESS_CODE), typed, Date.now(), usableCode(env.WATERLINK_COOKIE_SECRET));
}
