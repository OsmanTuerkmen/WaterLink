import { expect, test } from "@playwright/test";

test("the first screen is in the HTML, before any script runs", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Does our water point work today?" })).toBeVisible();
    await expect(page.getByText("Borehole A").first()).toBeVisible();

    await page.goto("/?view=display&lang=sw");
    await expect(page.getByRole("heading", { level: 1, name: "Je, chanzo chetu cha maji kinafanya kazi leo?" })).toBeVisible();
    await expect(page.getByText("Borehole A").first()).toBeVisible();
  } finally {
    await context.close();
  }
});

test("the board switches to Kiswahili, keeps it in the address, and offers a QR code to the SMS view", async ({ page }) => {
  await page.goto("/?view=display");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Does our water point work today?");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  const qr = page.getByRole("img", { name: "Scan to try the SMS check" });
  await expect(qr).toBeVisible();

  await page.getByRole("button", { name: "Kiswahili" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Je, chanzo chetu cha maji kinafanya kazi leo?");
  await expect(page).toHaveURL(/lang=sw/);
  await expect(page.locator(".board")).toHaveAttribute("lang", "sw");
  await expect(page.getByRole("button", { name: "Kiswahili" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("img", { name: "Changanua ili ujaribu ukaguzi wa SMS" })).toBeVisible();
  await expect(page.getByText(/draft translation/)).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Je, chanzo chetu cha maji kinafanya kazi leo?");

  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Does our water point work today?");
  await expect(page).not.toHaveURL(/lang=/);
});

test("a page whose scripts never start reloads itself instead of keeping an aging snapshot", async ({ browser, request }) => {
  // Without scripts the browser is asked to refresh the page.
  expect(await (await request.get("/?view=display")).text()).toMatch(/<noscript>\s*<meta http-equiv="refresh" content="60"/);

  // With scripts that fail to load, a timer in the HTML reloads the page after 30 seconds.
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.route("**/*", (route) => (route.request().resourceType() === "script" && !route.request().url().includes("reload") ? route.abort() : route.continue()));
    await page.clock.install();
    await page.goto("/?view=display");
    await expect(page.getByText("Borehole A").first()).toBeVisible();
    await expect(page.locator("html[data-hydrated]")).toHaveCount(0);
    const reloaded = page.waitForEvent("load");
    await page.clock.fastForward(31_000);
    await reloaded;
  } finally {
    await context.close();
  }
});

test("a shared link has a preview: title, description and an image", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toMatch(/<meta property="og:image" content="https:\/\/[^"]+\/og\.png"/);
  expect(html).toContain('name="twitter:card" content="summary_large_image"');
  const image = await request.get("/og.png");
  expect(image.headers()["content-type"]).toContain("image/png");
});

test("a tab that holds a newer revision than the server takes the server's state again", async ({ page }) => {
  // After the database was recreated, the server counts from the start again while an open tab remembers a higher number.
  let polls = 0;
  await page.route("**/api/waterlink?since=*", async (route) => {
    polls++;
    if (polls > 1) return route.continue();
    const real = await route.fetch({ url: `${new URL(route.request().url()).origin}/api/waterlink` });
    const body = await real.json();
    body.state.revision += 50;
    body.state.points[0].name = "Ahead of the server";
    await route.fulfill({ response: real, json: body });
  });
  await page.goto("/?view=display");
  await expect(page.getByText("Ahead of the server")).toBeVisible();
  await expect(page.getByText("Ahead of the server")).toHaveCount(0);
  await expect(page.getByText("Borehole A").first()).toBeVisible();
});
