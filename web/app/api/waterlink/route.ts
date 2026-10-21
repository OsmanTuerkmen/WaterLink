import { currentUserId } from "@/lib/access";
import { getDatabase } from "@/lib/database";
import { STATUS_TTL_MS } from "@/lib/domain";
import { errorResponse, HttpError, jsonResponse, readJsonBody, requireSameOrigin } from "@/lib/http";
import { requireDemoSession } from "@/lib/session";
import { getState, mutateState, parseCommand } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const now = new Date();
    const state = await getState(getDatabase(), now);
    const ttlHours = STATUS_TTL_MS / 3_600_000;
    // Screens poll every few seconds; when they already hold this revision the 40+ KB state is not sent again.
    const since = new URL(request.url).searchParams.get("since");
    if (since !== null && since !== "" && Number(since) === state.revision) {
      return jsonResponse({ unchanged: true, revision: state.revision, serverNow: now.toISOString(), ttlHours });
    }
    return jsonResponse({ state, serverNow: now.toISOString(), ttlHours });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const userId = await currentUserId();
    if (!userId) throw new HttpError(401, "Please sign in first.", "sign_in_required");
    const now = new Date();
    const db = getDatabase();
    const session = await requireDemoSession(db, request, userId, now);
    const payload = await readJsonBody(request);
    if (!Number.isSafeInteger(payload.expectedRevision) || (payload.expectedRevision as number) < 0) {
      throw new HttpError(400, "The expected revision is invalid.", "invalid_revision");
    }
    if (typeof payload.requestId !== "string" || !/^[A-Za-z0-9_-]{8,128}$/.test(payload.requestId)) {
      throw new HttpError(400, "The request ID is invalid.", "invalid_request_id");
    }
    const command = parseCommand(payload.command);
    const state = await mutateState(db, {
      command, expectedRevision: payload.expectedRevision as number, requestId: payload.requestId,
    }, session.actor, session.sessionKey, now);
    return jsonResponse({ state, serverNow: now.toISOString(), ttlHours: STATUS_TTL_MS / 3_600_000 });
  } catch (error) {
    return errorResponse(error);
  }
}
