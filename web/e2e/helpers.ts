import { expect, type BrowserContext } from "@playwright/test";

/** The local development server signs in as a test user when this address is opened. */
export async function signIn(context: BrowserContext) {
  const page = await context.newPage();
  await page.goto("/signin-with-chatgpt?return_to=/");
  await page.close();
}

/** Puts the shared demo back to its start, as the coordinator and through the API (like `npm run test:integration`). */
export async function resetDemo(context: BrowserContext, baseURL: string) {
  const headers = { Origin: new URL(baseURL).origin, "Content-Type": "application/json" };
  const session = await (await context.request.post("/api/session", { headers, data: { role: "coordinator" } })).json();
  const { state } = await (await context.request.get("/api/waterlink")).json();
  const reset = await context.request.post("/api/waterlink", {
    headers: { ...headers, Authorization: `Bearer ${session.token}` },
    data: { command: { type: "reset" }, expectedRevision: state.revision, requestId: crypto.randomUUID() },
  });
  expect(reset.ok()).toBeTruthy();
}

/** Every view of the app, as an address. */
export const VIEWS = [
  "/#status", "/#field/operator", "/#field/technician", "/#sms",
  "/#coordination/overview", "/#coordination/history", "/#coordination/demo",
  "/?view=display", "/?view=display&lang=sw", "/?view=stage",
];
