// Post-upgrade smoke tests: every key page must render its heading and
// throw no uncaught runtime errors. Run after any dependency upgrade.
import { test, expect } from "@playwright/test";

const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";

const pages = [
  { path: "/", name: "Home" },
  { path: "/blog", name: "Blog" },
  { path: "/projects", name: "Projects" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
  { path: "/auth", name: "Auth" },
  { path: "/tools/code-review", name: "Code review" },
];

for (const { path, name } of pages) {
  test(`${name} page renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const response = await page.goto(`${APP_URL}${path}`, { waitUntil: "domcontentloaded" });
    expect(response?.status() ?? 0).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("navigation").first()).toBeVisible();
    expect(errors, `Runtime errors on ${path}`).toEqual([]);
  });
}

test("unknown route shows the not-found page", async ({ page }) => {
  await page.goto(`${APP_URL}/this-page-does-not-exist`);
  await expect(page.locator("h1").first()).toBeVisible();
});
