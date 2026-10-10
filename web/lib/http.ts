import { DomainError } from "./domain";

/** Small, shared HTTP boundary for the two demo endpoints. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "request_failed",
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function jsonResponse(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      Vary: "Origin, Authorization",
    },
  });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return jsonResponse({ error: error.message, code: error.code }, error.status);
  }
  if (error instanceof DomainError) {
    return jsonResponse({ error: error.message, code: "invalid_transition" }, error.status);
  }
  // Do not return DB internals, account headers, or bearer tokens to visitors.
  console.error("WaterLink request failed:", error instanceof Error ? error.message : "unknown error");
  return jsonResponse(
    { error: "Speichern oder Laden ist gerade nicht möglich. Bitte erneut versuchen.", code: "server_error" },
    500,
  );
}

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new HttpError(403, "Diese Anfrage muss von der WaterLink-Seite stammen.", "invalid_origin");
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    throw new HttpError(403, "Anfragen von anderen Seiten sind nicht erlaubt.", "invalid_origin");
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Reads at most 16 KiB even when Content-Length is missing or forged. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new HttpError(415, "Die Anfrage muss JSON enthalten.", "invalid_content_type");
  }
  const limit = 16_384;
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > limit) {
    throw new HttpError(413, "Die Meldung ist zu lang.", "body_too_large");
  }
  if (!request.body) throw new HttpError(400, "Die Anfrage enthält keine Daten.", "invalid_body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new HttpError(413, "Die Meldung ist zu lang.", "body_too_large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new HttpError(400, "Die Anfrage enthält kein gültiges JSON.", "invalid_json");
  }
  if (!isRecord(value)) throw new HttpError(400, "Die Anfrage muss ein JSON-Objekt enthalten.", "invalid_body");
  return value;
}
