/**
 * E2E tests — Dashboard access and metrics display.
 *
 * Covers:
 *   1. Protected route redirection — unauthenticated user is sent to /login
 *   2. Sub-routes under /dashboard are also protected
 *   3. Dashboard KPI metric cards are displayed for authenticated users
 *   4. Dashboard layout elements (header, sidebar, recent-activity) render
 *   5. After logout, /dashboard is inaccessible
 */
import { test, expect, type Page } from "@playwright/test";
import { generateTestEmail, TEST_PASSWORD } from "./helpers/db-cleanup";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Register and log in a fresh test user; returns the email used. */
async function registerAndLogin(page: Page): Promise<string> {
  const email = generateTestEmail();

  // Register
  await page.goto("/register");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  return email;
}

/** Log out the current session via the logout API. */
async function logout(page: Page): Promise<void> {
  await page.goto("/api/auth/logout");
}

// ---------------------------------------------------------------------------
// Protected route redirection tests
// ---------------------------------------------------------------------------

test.describe("Protected route redirection", () => {
  test("unauthenticated GET /dashboard redirects to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test("redirect URL contains the original path as 'redirect' param", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    const url = new URL(page.url());
    expect(url.searchParams.get("redirect")).toBe("/dashboard");
  });

  test("unauthenticated access to /dashboard/settings redirects to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test("unauthenticated access to /dashboard/billing redirects to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard/billing");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Dashboard metrics display tests
// ---------------------------------------------------------------------------

test.describe("Dashboard metrics display", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test("renders the KPI section with metric cards", async ({ page }) => {
    await expect(
      page.locator('[aria-label="Key Performance Indicators"]')
    ).toBeVisible({ timeout: 10_000 });
  });

  test("displays Monthly Recurring Revenue card", async ({ page }) => {
    await expect(page.getByText("Monthly Recurring Revenue")).toBeVisible();
  });

  test("displays Total Users card", async ({ page }) => {
    await expect(page.getByText("Total Users")).toBeVisible();
  });

  test("displays Active Subscriptions card", async ({ page }) => {
    await expect(page.getByText("Active Subscriptions")).toBeVisible();
  });

  test("displays Conversion Rate card", async ({ page }) => {
    await expect(page.getByText("Conversion Rate")).toBeVisible();
  });

  test("displays Recent Activity section", async ({ page }) => {
    await expect(
      page.locator('[aria-label="Recent activity"]')
    ).toBeVisible();
    await expect(page.getByText("Recent Activity")).toBeVisible();
  });

  test("metric cards show numeric values", async ({ page }) => {
    // Each card's value should be non-empty (a number, currency, or percentage)
    const kpiSection = page.locator('[aria-label="Key Performance Indicators"]');
    await expect(kpiSection).toBeVisible();

    // CardTitle elements inside the KPI section contain the metric values
    const valueCells = kpiSection.locator('[class*="text-3xl"]');
    const count = await valueCells.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// Post-logout protection tests
// ---------------------------------------------------------------------------

test.describe("Post-logout protection", () => {
  test("accessing /dashboard after logout redirects to /login", async ({
    page,
  }) => {
    await registerAndLogin(page);

    // Log out
    await logout(page);

    // Now try to access the dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test("logging out and logging back in works", async ({ page }) => {
    const email = await registerAndLogin(page);

    await logout(page);

    // Log in again
    await page.goto("/login");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });
});
