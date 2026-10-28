// tests/performance.spec.js
// TC-PERF-01 through TC-PERF-06
// Tests: Performance Review list, top navigation menus, KPIs, My Reviews, search
//
// Note: "Configure" and "Manage Reviews" in the top bar are click-to-open dropdowns,
// not links, and their items (KPIs, My Reviews...) only exist once opened.

const { test, expect } = require('@playwright/test');
const { ROUTES } = require('../utils/constants');
const { openPage, waitForPageReady, topNavTab, openTopNavItem } = require('../utils/helpers');

test.describe('Performance Management', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, ROUTES.performance);
  });

  // TC-PERF-01: Performance module loads
  test('TC-PERF-01: should load Performance Review List page', async ({ page }) => {
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Performance');
    await expect(page.locator('.oxd-table')).toBeVisible();
  });

  // TC-PERF-02: Top navigation shows all Performance sections
  test('TC-PERF-02: should show Performance sub-navigation', async ({ page }) => {
    for (const tab of ['Configure', 'Manage Reviews', 'My Trackers', 'Employee Trackers']) {
      await expect(topNavTab(page, tab)).toBeVisible();
    }
    // Manage Reviews opens a menu with the three review views
    await topNavTab(page, 'Manage Reviews').click();
    const menu = page.locator('.oxd-dropdown-menu');
    for (const item of ['Manage Reviews', 'My Reviews', 'Employee Reviews']) {
      await expect(menu.getByText(item, { exact: true })).toBeVisible();
    }
  });

  // TC-PERF-03: Configure menu shows KPIs and Trackers
  test('TC-PERF-03: should display Configure menu under Performance', async ({ page }) => {
    await topNavTab(page, 'Configure').click();
    const menu = page.locator('.oxd-dropdown-menu');
    await expect(menu.getByText('KPIs', { exact: true })).toBeVisible();
    await expect(menu.getByText('Trackers', { exact: true })).toBeVisible();
  });

  // TC-PERF-04: KPI list page accessible
  test('TC-PERF-04: should navigate to KPIs page', async ({ page }) => {
    await openTopNavItem(page, 'Configure', 'KPIs');
    await page.waitForURL(/searchKpi/);
    await waitForPageReady(page);
    await expect(page.locator('.oxd-table-header')).toBeVisible();
  });

  // TC-PERF-05: My Reviews page loads
  test('TC-PERF-05: should load My Reviews page', async ({ page }) => {
    await openTopNavItem(page, 'Manage Reviews', 'My Reviews');
    await page.waitForURL(/myPerformanceReview/);
    await waitForPageReady(page);
    await expect(page.locator('.oxd-table')).toBeVisible();
  });

  // TC-PERF-06: Performance search filter works
  test('TC-PERF-06: should apply Performance Review search filters', async ({ page }) => {
    await expect(page.locator('.oxd-select-wrapper').first()).toBeVisible();
    await page.locator('button[type="submit"]').click();
    await waitForPageReady(page);
    await expect(page.locator('.oxd-table')).toBeVisible();
  });
});
