import { expect, test } from "@playwright/test";
import { resetDemo, signIn } from "./helpers";

test("report, repair and on-site test: a second window follows live and only the test turns it green", async ({ browser, baseURL }) => {
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const screen = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  try {
    await signIn(phone, baseURL);
    await resetDemo(phone, baseURL!);

    // Window 1: the public board.
    const board = await screen.newPage();
    await board.goto("/?view=display");
    await board.locator("html[data-hydrated]").waitFor({ state: "attached" });
    const rowA = board.getByRole("listitem").filter({ hasText: "Borehole A" });
    await expect(rowA).toContainText("Working");

    // Window 2: Amina, the operator, reports that A has no water.
    const operator = await phone.newPage();
    await operator.goto("/#field/operator");
    await operator.getByRole("listitem").filter({ hasText: "Borehole A" }).getByRole("button", { name: "Report a problem" }).click();
    await operator.getByRole("button", { name: /No water/ }).click();
    await operator.getByRole("button", { name: "Next" }).click();
    await operator.getByLabel("What is wrong?").fill("No water after 20 pumps.");
    await operator.getByLabel(/I am at the water point/).check();
    await operator.getByRole("button", { name: "Send report" }).click();
    await expect(operator.getByRole("heading", { name: "Report sent" })).toBeVisible();

    // The board shows the outage and the confirmed alternative without anyone reloading it.
    await expect(rowA).toContainText("Not working");
    await expect(rowA).toContainText("Go to B");

    // Daniel, the technician, takes the job and reports the repair.
    const technician = await phone.newPage();
    await technician.goto("/#field/technician");
    await technician.getByRole("button", { name: /take this job/ }).click();
    await technician.getByRole("button", { name: /start work/ }).click();
    await technician.getByRole("button", { name: /Report repair/ }).click();
    await technician.getByLabel(/What did you do/).fill("Replaced the cup seal, tested 10 litres.");
    await technician.getByRole("button", { name: "Repaired, ask for test" }).click();
    await expect(technician.getByText(/Waiting for the operator to test/)).toBeVisible();

    // A reported repair is not a working water point: the board must stay on "Not working" past several polls.
    await board.waitForTimeout(7_000);
    await expect(rowA).toContainText("Not working");

    // Only Amina's test on site turns it back to working and closes the job.
    await operator.getByRole("button", { name: "Back to my water points" }).click();
    await operator.getByRole("listitem").filter({ hasText: "Borehole A" }).getByRole("button", { name: "Test and confirm" }).click();
    await operator.getByRole("button", { name: /Works/ }).first().click();
    await operator.getByRole("button", { name: "Next" }).click();
    await operator.getByLabel("Your check").fill("Pumped 20 litres, steady flow.");
    await operator.getByLabel(/I tested it on site/).check();
    await operator.getByRole("button", { name: "Confirm result" }).click();
    await expect(operator.getByRole("heading", { name: "Confirmed working" })).toBeVisible();
    await expect(rowA).toContainText("Working");
    await expect(rowA).not.toContainText("Not working");
  } finally {
    await resetDemo(phone, baseURL!).catch(() => {});
    await phone.close();
    await screen.close();
  }
});

test("the board never shows an old green when the connection is gone, and recovers by itself", async ({ browser, baseURL }) => {
  const setup = await browser.newContext();
  await signIn(setup, baseURL);
  await resetDemo(setup, baseURL!);
  await setup.close();

  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  try {
    const page = await context.newPage();
    await page.goto("/?view=display");
    await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
    const rowA = page.getByRole("listitem").filter({ hasText: "Borehole A" });
    await expect(rowA).toContainText("Working");

    await context.setOffline(true);
    await expect(page.getByText("No connection. Today’s state is not confirmed.")).toBeVisible();
    await expect(rowA).toContainText("Unclear");
    await expect(rowA).not.toContainText("You can fetch water here");

    await context.setOffline(false);
    await expect(rowA).toContainText("Working");
    await expect(page.getByText("No connection. Today’s state is not confirmed.")).toBeHidden();
  } finally {
    await context.close();
  }
});
