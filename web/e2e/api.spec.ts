import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";

// The API flow script (sign-in, roles, retries, races, repair confirmation) runs against the same development
// server as the browser tests, so `npm run test:e2e` and the CI job cover it without a second server.
test("the API flow: sign-in, roles, retries, concurrency and repair confirmation", async ({ baseURL }) => {
  const output = execFileSync(process.execPath, ["scripts/check-flow.mjs"], {
    env: { ...process.env, WATERLINK_BASE_URL: baseURL }, encoding: "utf8", timeout: 120_000,
  });
  expect(output).toContain("PASS");
});
