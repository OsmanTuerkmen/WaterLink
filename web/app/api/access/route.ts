import { authMode, currentUserId, redeemAccessCode } from "@/lib/access";
import { clearClientAttempts, clientKey, registerAttempt } from "@/lib/access-limit";
import { getDatabase } from "@/lib/database";
import { errorResponse, HttpError, jsonResponse, readJsonBody, requireSameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";

/** How this deployment signs people in, and whether the visitor is signed in. */
export async function GET() {
  try {
    return jsonResponse({ mode: authMode(), signedIn: Boolean(await currentUserId()) });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Exchanges the shared demo access code for a signed cookie (self-hosted mode only). */
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    if (authMode() !== "code") throw new HttpError(404, "This deployment signs in through its platform.", "not_available");
    const payload = await readJsonBody(request);
    const db = getDatabase();
    // Cloudflare sets this header itself; a visitor cannot choose it on the deployed worker.
    const client = await clientKey(request.headers.get("cf-connecting-ip"));
    const limit = await registerAttempt(db, client, Date.now());
    if (!limit.allowed) {
      const minutes = Math.ceil(limit.retryAfterS / 60);
      const response = errorResponse(new HttpError(429, `Too many sign-in attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`, "rate_limited"));
      response.headers.set("Retry-After", String(limit.retryAfterS));
      return response;
    }
    const cookie = await redeemAccessCode(payload.code);
    if (!cookie) throw new HttpError(401, "That access code is not right.", "invalid_code");
    await clearClientAttempts(db, client);
    const response = jsonResponse({ mode: "code", signedIn: true });
    response.headers.append("Set-Cookie", cookie);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
