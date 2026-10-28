// tests/time.spec.js
// TC-TIME-01 through TC-TIME-05
// Tests: Timesheet, attendance punch in/out, attendance records, timesheet navigation

const { test, expect } = require('@playwright/test');
const { ROUTES } = require('../utils/constants');
const { openPage, waitForPageReady, topNavTab } = require('../utils/helpers');

test.describe('Time & Attendance', () => {
  // TC-TIME-01: My Timesheet page loads
  test('TC-TIME-01: should load My Timesheet page', async ({ page }) => {
    await openPage(page, ROUTES.timesheet);
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Time');
    await expect(page.locator('h6.orangehrm-main-title')).toHaveText('My Timesheet');
    await expect(page.locator('.orangehrm-timesheet-header')).toBeVisible();
  });

  // TC-TIME-02: Time module sub-navigation accessible
  test('TC-TIME-02: should display Time module sub-nav', async ({ page }) => {
    await openPage(page, ROUTES.timesheet);
    // These are dropdown menus in the top bar, not plain links
    for (const tab of ['Timesheets', 'Attendance', 'Reports', 'Project Info']) {
      await expect(topNavTab(page, tab)).toBeVisible();
    }
  });

  // TC-TIME-03: Punch In/Out page loads
  test('TC-TIME-03: should load the Punch In/Out page', async ({ page }) => {
    await openPage(page, ROUTES.punchIn);
    // Shows "Punch In" or "Punch Out" depending on the shared admin's current state
    await expect(page.locator('h6.orangehrm-main-title')).toHaveText(/Punch (In|Out)/);
    await expect(page.locator('.orangehrm-card-container')).toBeVisible();
  });

  // TC-TIME-04: View Attendance page accessible
  test('TC-TIME-04: should load View Attendance page', async ({ page }) => {
    await openPage(page, ROUTES.myAttendance);
    await expect(page.locator('h5', { hasText: 'My Attendance Records' })).toBeVisible();
    await expect(page.locator('.oxd-table')).toBeVisible();
  });

  // TC-TIME-05: Timesheet navigation (previous week) works
  test('TC-TIME-05: should navigate timesheets with prev/next week buttons', async ({ page }) => {
    await openPage(page, ROUTES.timesheet);

    // The period picker's own buttons (the sidebar toggle uses the same chevron icon)
    const period = page.locator('.orangehrm-timeperiod-picker input');
    const before = await period.inputValue();

    await page.locator('.orangehrm-timeperiod-icon.--prev').click();
    await waitForPageReady(page);
    await expect(period).not.toHaveValue(before);

    await page.locator('.orangehrm-timeperiod-icon.--next').click();
    await waitForPageReady(page);
    await expect(period).toHaveValue(before);
  });
});
