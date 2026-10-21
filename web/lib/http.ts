import { DomainError } from "./domain.ts";

/** Small, shared HTTP boundary for the two demo endpoints. */
export class HttpError extends Error {
  // Plain fields, not parameter properties, so the tests can run the file with Node's type stripping.
  readonly status: number;
  readonly code: string;
  constructor(status: number, message: string, code = "request_failed") {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
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
    { error: "Saving or loading is not possible right now. Please try again.", code: "server_error" },
    500,
  );
}

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new HttpError(403, "This request has to come from the WaterLink page.", "invalid_origin");
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    throw new HttpError(403, "Requests from other sites are not allowed.", "invalid_origin");
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Reads at most 16 KiB even when Content-Length is missing or forged. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new HttpError(415, "The request must contain JSON.", "invalid_content_type");
  }
  const limit = 16_384;
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > limit) {
    throw new HttpError(413, "The request is too large.", "body_too_large");
  }
  if (!request.body) throw new HttpError(400, "The request contains no data.", "invalid_body");
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
        throw new HttpError(413, "The request is too large.", "body_too_large");
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
    throw new HttpError(400, "The request is not valid JSON.", "invalid_json");
  }
  if (!isRecord(value)) throw new HttpError(400, "The request must contain a JSON object.", "invalid_body");
  return value;
}
