import { currentUserId } from "@/lib/access";
import { getDatabase } from "@/lib/database";
import { errorResponse, HttpError, jsonResponse, readJsonBody, requireSameOrigin } from "@/lib/http";
import { createDemoSession, parseRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const userId = await currentUserId();
    if (!userId) throw new HttpError(401, "Please sign in first, then choose a demo role.", "sign_in_required");
    const payload = await readJsonBody(request);
    const role = parseRole(payload.role);
    const session = await createDemoSession(getDatabase(), userId, role);
    return jsonResponse(session, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
