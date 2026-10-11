import { authMode, currentUserId, redeemAccessCode } from "@/lib/access";
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
    const cookie = await redeemAccessCode(payload.code);
    if (!cookie) {
      // A small delay keeps guessing slow without needing storage.
      await new Promise((resolve) => setTimeout(resolve, 800));
      throw new HttpError(401, "That access code is not right.", "invalid_code");
    }
    const response = jsonResponse({ mode: "code", signedIn: true });
    response.headers.append("Set-Cookie", cookie);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
