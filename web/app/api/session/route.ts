import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDatabase } from "@/lib/database";
import { errorResponse, HttpError, jsonResponse, readJsonBody, requireSameOrigin } from "@/lib/http";
import { createDemoSession, parseRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await getChatGPTUser();
    if (!user) throw new HttpError(401, "Bitte zuerst mit ChatGPT anmelden und dann eine Demo-Rolle auswählen.", "sign_in_required");
    const payload = await readJsonBody(request);
    const role = parseRole(payload.role);
    const session = await createDemoSession(getDatabase(), user.userId, role);
    return jsonResponse(session, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
