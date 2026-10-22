import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { VIEWS } from "./helpers";

for (const view of VIEWS) {
  test(`accessibility: no WCAG A/AA violation found by axe on ${view}`, async ({ page }) => {
    await page.goto(view);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    // Let the map, fonts and polling settle so axe sees the finished page.
    await page.waitForTimeout(800);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const summary = result.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} element(s), e.g. ${v.nodes[0]?.target.join(" ")}`);
    expect(summary).toEqual([]);
  });
}

test.describe("phone width", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

  for (const view of VIEWS.filter((v) => !v.includes("view=stage"))) {
    test(`no sideways scrolling and no touch target under 44 px on ${view}`, async ({ page }) => {
      await page.goto(view);
      await page.getByRole("heading", { level: 1 }).first().waitFor();
      await page.waitForTimeout(800);
      const result = await page.evaluate(() => {
        const small = [...document.querySelectorAll<HTMLElement>("a, button, input, select, textarea, [role=button], [tabindex]:not([tabindex='-1'])")]
          .filter((e) => {
            const box = e.getBoundingClientRect(), style = getComputedStyle(e);
            return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && (box.height < 43.5 || box.width < 43.5);
          })
          .map((e) => `${(e.innerText || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 30)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
        return { overflow: document.documentElement.scrollWidth - window.innerWidth, small };
      });
      expect(result.overflow).toBeLessThanOrEqual(0);
      expect(result.small).toEqual([]);
    });
  }
});

test("the status sheet prints on one A4 page", async ({ page }) => {
  await page.goto("/#status");
  await page.getByRole("heading", { level: 1 }).first().waitFor();
  await page.emulateMedia({ media: "print" });
  const pdf = await page.pdf({ format: "A4", preferCSSPageSize: true });
  const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page(?![a-z])/g) ?? []).length;
  expect(pages).toBe(1);
});

test("accessibility: the forms for adding a water point and checking a route have no WCAG A/AA violation", async ({ page }) => {
  await page.goto("/?sandbox=1#coordination/overview");
  await page.getByRole("heading", { level: 1 }).first().waitFor();
  await page.getByRole("button", { name: "Add a water point" }).click();
  await page.getByRole("button", { name: "Check route and access" }).first().click();
  await page.getByRole("button", { name: "Pick on the map" }).click();
  await page.locator(".nmap svg").click({ position: { x: 60, y: 60 } });
  await page.getByRole("button", { name: "Pick on the map" }).click();
  await page.waitForTimeout(500);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const summary = result.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} element(s), e.g. ${v.nodes[0]?.target.join(" ")}`);
  expect(summary).toEqual([]);
});
