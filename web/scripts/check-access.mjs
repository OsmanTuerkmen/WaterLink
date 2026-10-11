// Checks the demo access in code mode against a LOCAL worker. Never run against the live demo:
// the wrong-code burst locks new sign-ins from this client for 15 minutes.
//   web/.dev.vars:  WATERLINK_AUTH=code  and  DEMO_ACCESS_CODE=<a local test code>
//   npm run dev -- --port 5175
//   WATERLINK_BASE_URL=http://127.0.0.1:5175 DEMO_ACCESS_CODE=<same test code> npm run test:access
import assert from "node:assert/strict";
const BASE = process.env.WATERLINK_BASE_URL || "http://127.0.0.1:5173";
assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(new URL(BASE).hostname), "Access checks only run on a local demo.");
const CODE = process.env.DEMO_ACCESS_CODE;
assert.ok(CODE, "Set DEMO_ACCESS_CODE to the local test code from web/.dev.vars.");
const json = { "Content-Type": "application/json", Origin: BASE };
const post = (path, body, extra = {}) => fetch(BASE + path, { method: "POST", headers: { ...json, ...extra }, body: JSON.stringify(body) });
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`); };

const forged = { "oai-authenticated-user-id": "forged-user", "oai-authenticated-user-email": "x@example.org" };
let r = await post("/api/session", { role: "operator" }, forged);
check("forged platform headers without cookie cannot open a session", r.status === 401, `HTTP ${r.status}`);

r = await post("/api/access", { code: ` ${CODE.toUpperCase()} ` });
const setCookie = r.headers.get("set-cookie") ?? "";
const cookie = setCookie.split(";", 1)[0];
check("correct code (case/space-insensitive) returns a signed cookie", r.status === 200 && /^wl_access=v2\.\d+\.[0-9a-f]{64}$/.test(cookie), `HTTP ${r.status}`);
check("cookie is HttpOnly, Secure, SameSite=Strict, 30 days", /HttpOnly/.test(setCookie) && /Secure/.test(setCookie) && /SameSite=Strict/.test(setCookie) && /Max-Age=2592000/.test(setCookie));

r = await fetch(BASE + "/api/access", { headers: { Cookie: cookie } });
check("server accepts the cookie", (await r.json()).signedIn === true);
r = await post("/api/session", { role: "operator" }, { Cookie: cookie });
check("cookie opens a demo session", r.status === 201, `HTTP ${r.status}`);

const [, exp, mac] = cookie.split("=")[1].split(".");
const tampered = `wl_access=v2.${Number(exp) + 86400}.${mac}`;
r = await fetch(BASE + "/api/access", { headers: { Cookie: tampered } });
check("cookie with extended expiry is rejected", (await r.json()).signedIn === false);
r = await post("/api/session", { role: "operator" }, { Cookie: tampered, ...forged });
check("tampered cookie plus forged headers cannot open a session", r.status === 401, `HTTP ${r.status}`);

const attempts = await Promise.all(Array.from({ length: 15 }, (_, i) => post("/api/access", { code: `wrong-code-${i}` })));
const statuses = attempts.map((a) => a.status);
const wrong = statuses.filter((s) => s === 401).length, limited = statuses.filter((s) => s === 429).length;
check("15 parallel wrong attempts: at most 10 are checked, the rest are limited", wrong === 10 && limited === 5, `401×${wrong}, 429×${limited}`);
const limitedResponse = attempts.find((a) => a.status === 429);
check("limited response carries Retry-After", Number(limitedResponse?.headers.get("retry-after")) > 0, `Retry-After ${limitedResponse?.headers.get("retry-after")}`);
r = await post("/api/access", { code: CODE });
check("during the lockout even the correct code is not checked", r.status === 429, `HTTP ${r.status}`);
r = await fetch(BASE + "/api/access", { headers: { Cookie: cookie } });
check("an existing valid cookie keeps working during the lockout", (await r.json()).signedIn === true);

console.log(results.every(Boolean) ? "\nALL PASSED" : "\nFAILURES");
process.exit(results.every(Boolean) ? 0 : 1);
