// tests/dashboard.spec.js
// TC-DASH-01 through TC-DASH-03
// Tests: Sidebar navigation, header, user dropdown

const { test, expect } = require('@playwright/test');
const { ROUTES } = require('../utils/constants');
const { openPage } = require('../utils/helpers');

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, ROUTES.dashboard);
  });

  // TC-DASH-01: Sidebar navigation items are all visible
  test('TC-DASH-01: should display all sidebar navigation items', async ({ page }) => {
    const expectedMenuItems = ['Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'My Info', 'Performance', 'Dashboard', 'Directory', 'Maintenance', 'Buzz'];
    for (const item of expectedMenuItems) {
      await expect(page.locator('.oxd-main-menu-item span', { hasText: item }).first()).toBeVisible();
    }
  });

  // TC-DASH-02: Top header shows username and logo
  test('TC-DASH-02: should display header with user info', async ({ page }) => {
    await expect(page.locator('.oxd-userdropdown-name')).toBeVisible();
    await expect(page.locator('.oxd-brand-banner')).toBeVisible();
  });

  // TC-DASH-03: User dropdown shows profile and logout options
  test('TC-DASH-03: should open user dropdown with profile options', async ({ page }) => {
    await page.locator('.oxd-userdropdown-tab').click();
    for (const option of ['About', 'Support', 'Change Password', 'Logout']) {
      await expect(page.locator('.oxd-userdropdown-link', { hasText: option })).toBeVisible();
    }
  });
});
