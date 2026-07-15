// RBAC smoke tests for /admin/security. Verifies the page is not reachable
// from any unauthenticated state, and that non-admin authenticated users are
// redirected away from the admin surface. The admin-authenticated case is
// intentionally not asserted here because it requires seeding an admin user.

import { test, expect } from "@playwright/test";

const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";
const ADMIN_PATH = "/admin/security";

test.describe("/admin/security RBAC", () => {
  test.beforeEach(async ({ context }) => {
    // Ensure no prior session leaks between specs.
    await context.clearCookies();
  });

  test("signed-out user is redirected to /auth", async ({ page }) => {
    await page.goto(`${APP_URL}${ADMIN_PATH}`);
    await page.waitForURL(/\/auth(\?|$)/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/auth(\?|$)/);
    // The audit surface must never render for signed-out users.
    await expect(page.getByRole("heading", { name: /security audit/i })).toHaveCount(0);
  });

  test("stale supabase session is not enough to load the admin surface", async ({ page }) => {
    // Simulate an attacker that plants a fake session in storage. The route
    // guard combines useAuth with useAdminCheck, so a bogus token must still
    // resolve to a non-admin state and be redirected.
    await page.addInitScript(() => {
      const fake = {
        access_token: "not.a.real.token",
        refresh_token: "not.a.real.refresh",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: "bearer",
        user: { id: "00000000-0000-0000-0000-000000000000", email: "impostor@example.com" },
      };
      try {
        window.localStorage.setItem("sb-fake-auth-token", JSON.stringify(fake));
      } catch {
        // ignore quota / storage errors
      }
    });
    await page.goto(`${APP_URL}${ADMIN_PATH}`);
    await page.waitForLoadState("networkidle");
    // Either redirected to /auth (no session) or to / (session but not admin).
    expect(page.url()).not.toContain(ADMIN_PATH);
    await expect(page.getByRole("heading", { name: /security audit/i })).toHaveCount(0);
  });

  test("non-admin authenticated user cannot reach the surface", async ({ page }) => {
    const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
    const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;
    test.skip(!email || !password, "Set PLAYWRIGHT_TEST_USER_EMAIL/PASSWORD to run this case");

    await page.goto(`${APP_URL}/auth`);
    await page.getByLabel(/email/i).first().fill(email!);
    await page.getByLabel(/password/i).first().fill(password!);
    await page.getByRole("button", { name: /sign in|log in/i }).first().click();
    await page.waitForLoadState("networkidle");

    await page.goto(`${APP_URL}${ADMIN_PATH}`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain(ADMIN_PATH);
    await expect(page.getByRole("heading", { name: /security audit/i })).toHaveCount(0);
  });
});
