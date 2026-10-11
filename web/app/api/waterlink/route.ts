import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDatabase } from "@/lib/database";
import { STATUS_TTL_MS } from "@/lib/domain";
import { errorResponse, HttpError, jsonResponse, readJsonBody, requireSameOrigin } from "@/lib/http";
import { requireDemoSession } from "@/lib/session";
import { getState, mutateState, parseCommand } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const state = await getState(getDatabase(), now);
    return jsonResponse({ state, serverNow: now.toISOString(), ttlHours: STATUS_TTL_MS / 3_600_000 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await getChatGPTUser();
    if (!user) throw new HttpError(401, "Please sign in first.", "sign_in_required");
    const now = new Date();
    const db = getDatabase();
    const session = await requireDemoSession(db, request, user.userId, now);
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
