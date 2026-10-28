// tests/auth.spec.js
// TC-AUTH-01 through TC-AUTH-05
// Tests: login success, invalid credentials, logout, forgot password page, session persistence

const { test, expect } = require('@playwright/test');
const { CREDENTIALS, ROUTES } = require('../utils/constants');

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Start fresh (no saved session)

  // TC-AUTH-01: Successful login with valid admin credentials
  test('TC-AUTH-01: should login successfully with valid credentials', async ({ page }) => {
    await page.goto(ROUTES.login);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('.orangehrm-login-logo')).toBeVisible();

    await page.fill('input[name="username"]', CREDENTIALS.admin.username);
    await page.fill('input[name="password"]', CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard/**', { timeout: 25000 });
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toBeVisible();
    await expect(page.locator('.oxd-userdropdown-name')).toBeVisible();
  });

  // TC-AUTH-02: Login fails with invalid password
  test('TC-AUTH-02: should show error with invalid password', async ({ page }) => {
    await page.goto(ROUTES.login);
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'wrongpassword999');
    await page.click('button[type="submit"]');

    await expect(page.locator('.oxd-alert-content-text')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.oxd-alert-content-text')).toContainText('Invalid credentials');
  });

  // TC-AUTH-03: Login fails with empty fields
  test('TC-AUTH-03: should show validation errors for empty fields', async ({ page }) => {
    await page.goto(ROUTES.login);
    await page.click('button[type="submit"]');

    const errors = page.locator('.oxd-input-field-error-message');
    await expect(errors.first()).toBeVisible({ timeout: 8000 });
    await expect(errors).toHaveCount(2); // Username + Password errors
  });

  // TC-AUTH-04: Forgot Password page renders correctly
  test('TC-AUTH-04: should navigate to forgot password page', async ({ page }) => {
    await page.goto(ROUTES.login);
    await page.click('text=Forgot your password?');

    await expect(page).toHaveURL(/requestPasswordResetCode/);
    await expect(page.locator('h6')).toContainText('Reset Password');
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  // TC-AUTH-05: Logout clears session and redirects to login
  test('TC-AUTH-05: should logout successfully', async ({ page }) => {
    // Login first
    await page.goto(ROUTES.login);
    await page.fill('input[name="username"]', CREDENTIALS.admin.username);
    await page.fill('input[name="password"]', CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/**', { timeout: 25000 });

    // Logout
    await page.click('.oxd-userdropdown-tab');
    await page.click('text=Logout');

    await page.waitForURL('**/auth/login**', { timeout: 10000 });
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // Verify protected route redirects back to login
    await page.goto(ROUTES.dashboard);
    await expect(page).toHaveURL(/auth\/login/);
  });
});
