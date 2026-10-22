import { expect, test, type Page } from "@playwright/test";

const sandboxBar = (page: Page) => page.getByRole("status").filter({ hasText: "Sandbox." });
const alive = (page: Page) => page.locator("html[data-hydrated]").waitFor({ state: "attached" });

async function reportAWithoutWater(page: Page) {
  await page.getByRole("listitem").filter({ hasText: "Borehole A" }).getByRole("button", { name: "Report a problem" }).click();
  await page.getByRole("button", { name: /No water/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("What is wrong?").fill("No water after 20 pumps.");
  await page.getByLabel(/I am at the water point/).check();
}

test("anyone can play the whole story on the stage without a code, and the shared demo stays untouched", async ({ page, request }) => {
  const before = await (await request.get("/api/waterlink")).json();

  await page.goto("/?view=stage&sandbox=1");
  await alive(page);
  await expect(sandboxBar(page)).toBeVisible();

  const amina = page.getByRole("region", { name: /Amina/ });
  const daniel = page.getByRole("region", { name: /Daniel/ });
  const rowA = page.locator(".stage-screen").getByRole("listitem").filter({ hasText: "Borehole A" });
  await expect(rowA).toContainText("Working");

  await amina.getByRole("listitem").filter({ hasText: "Borehole A" }).getByRole("button", { name: "Report a problem" }).click();
  await amina.getByRole("button", { name: /No water/ }).click();
  await amina.getByRole("button", { name: "Next" }).click();
  await amina.getByLabel("What is wrong?").fill("No water after 20 pumps.");
  await amina.getByLabel(/I am at the water point/).check();
  await amina.getByRole("button", { name: "Send report" }).click();
  await expect(amina.getByRole("heading", { name: "Report sent" })).toBeVisible();
  await expect(rowA).toContainText("Not working");
  await expect(rowA).toContainText("Go to B");

  await daniel.getByRole("button", { name: /take this job/ }).click();
  await daniel.getByRole("button", { name: /start work/ }).click();
  await daniel.getByRole("button", { name: /Report repair/ }).click();
  await daniel.getByLabel(/What did you do/).fill("Replaced the cup seal, tested 10 litres.");
  await daniel.getByRole("button", { name: "Repaired, ask for test" }).click();
  await expect(rowA).toContainText("Not working");

  await amina.getByRole("button", { name: "Back to my water points" }).click();
  await amina.getByRole("listitem").filter({ hasText: "Borehole A" }).getByRole("button", { name: "Test and confirm" }).click();
  await amina.getByRole("button", { name: /Works/ }).first().click();
  await amina.getByRole("button", { name: "Next" }).click();
  await amina.getByLabel("Your check").fill("Pumped 20 litres, steady flow.");
  await amina.getByLabel(/I tested it on site/).check();
  await amina.getByRole("button", { name: "Confirm result" }).click();
  await expect(rowA).toContainText("Working");

  // Nothing reached the server.
  const after = await (await request.get("/api/waterlink")).json();
  expect(after.state.revision).toBe(before.state.revision);
  expect(after.state.jobs.length).toBe(before.state.jobs.length);

  // "Reset practice data" starts over, still in the sandbox.
  await sandboxBar(page).getByRole("button", { name: "Reset practice data" }).click();
  await expect(sandboxBar(page)).toBeVisible();
});

test("the Try it yourself button starts the sandbox, and leaving it returns to the shared demo", async ({ page }) => {
  await page.goto("/");
  await alive(page);
  await expect(sandboxBar(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Try it yourself" }).click();
  await expect(page).toHaveURL(/sandbox=1/);
  await expect(sandboxBar(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Try it yourself" })).toHaveCount(0);

  await page.getByRole("link", { name: "Field app" }).click();
  await reportAWithoutWater(page);
  await page.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByRole("heading", { name: "Report sent" })).toBeVisible();

  // It survives a reload of the tab ...
  await page.reload();
  await alive(page);
  await expect(sandboxBar(page)).toBeVisible();
  await page.getByRole("link", { name: "Status" }).click();
  await expect(page.getByText("Not working").first()).toBeVisible();

  // ... and leaving shows the shared demo again, which never heard of the report.
  await sandboxBar(page).getByRole("button", { name: "Leave sandbox" }).click();
  await expect(sandboxBar(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(/sandbox/);
  await expect(page.getByText("Not working")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Try it yourself" })).toBeVisible();
});

test("when an action needs a code, the sandbox is offered and the draft can be sent there", async ({ page }) => {
  await page.goto("/#field/operator");
  await alive(page);
  await reportAWithoutWater(page);
  await page.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: /try it in the sandbox/i }).first().click();
  await expect(sandboxBar(page)).toBeVisible();
  await page.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByRole("heading", { name: "Report sent" })).toBeVisible();
});
