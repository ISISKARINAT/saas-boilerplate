/**
 * E2E tests — Authentication flows.
 *
 * Covers:
 *   1. User registration (happy path and validation errors)
 *   2. Login with valid credentials → redirects to /dashboard
 *   3. Login with invalid credentials → shows error
 *   4. Authenticated user accessing /login or /register → redirected to /dashboard
 */
import { test, expect, type Page } from "@playwright/test";
import { generateTestEmail, TEST_PASSWORD } from "./helpers/db-cleanup";

// Shared test email created in the registration test and reused in login tests
let registeredEmail: string;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fillRegistrationForm(
  page: Page,
  email: string,
  password: string,
  confirmPassword: string
): Promise<void> {
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', confirmPassword);
}

async function fillLoginForm(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
}

// ---------------------------------------------------------------------------
// Registration tests
// ---------------------------------------------------------------------------

test.describe("Registration", () => {
  test("renders the registration page", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator("h1, [class*='CardTitle']").first()).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test("shows validation error when passwords do not match", async ({
    page,
  }) => {
    await page.goto("/register");
    await fillRegistrationForm(
      page,
      generateTestEmail(),
      "Password123!",
      "DifferentPassword!"
    );
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("shows error for invalid email format", async ({ page }) => {
    await page.goto("/register");
    await fillRegistrationForm(page, "not-an-email", TEST_PASSWORD, TEST_PASSWORD);
    await page.click('button[type="submit"]');
    // HTML5 validation or server-side error should be visible
    const emailInput = page.locator('input[name="email"]');
    const isInvalid = await emailInput.evaluate(
      (el) => !(el as HTMLInputElement).validity.valid
    );
    expect(isInvalid).toBe(true);
  });

  test("registers a new user and redirects to /dashboard", async ({ page }) => {
    registeredEmail = generateTestEmail();
    await page.goto("/register");
    await fillRegistrationForm(page, registeredEmail, TEST_PASSWORD, TEST_PASSWORD);
    await page.click('button[type="submit"]');
    // Should redirect to /dashboard after successful registration
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("shows error when email is already registered", async ({ page }) => {
    // Uses the email registered in the previous test
    await page.goto("/register");
    await fillRegistrationForm(
      page,
      registeredEmail,
      TEST_PASSWORD,
      TEST_PASSWORD
    );
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Login tests
// ---------------------------------------------------------------------------

test.describe("Login", () => {
  test("renders the login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("shows error with wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await fillLoginForm(page, "nonexistent@example.com", "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("logs in with valid credentials and redirects to /dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    await fillLoginForm(page, registeredEmail, TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("authenticated user visiting /login is redirected to /dashboard", async ({
    page,
  }) => {
    // Log in first
    await page.goto("/login");
    await fillLoginForm(page, registeredEmail, TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // Navigate to /login — should be redirected back to /dashboard
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test("authenticated user visiting /register is redirected to /dashboard", async ({
    page,
  }) => {
    // Log in first
    await page.goto("/login");
    await fillLoginForm(page, registeredEmail, TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // Navigate to /register — should be redirected back to /dashboard
    await page.goto("/register");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });
});
