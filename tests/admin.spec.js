// tests/admin.spec.js
// TC-ADM-01 through TC-ADM-08
// Tests: System Users, Job Titles, Pay Grades, Locations, Admin navigation

const { test, expect } = require('@playwright/test');
const { ROUTES } = require('../utils/constants');
const { openPage, waitForPageReady, topNavTab } = require('../utils/helpers');

test.describe('Admin Module', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, ROUTES.admin);
  });

  // TC-ADM-01
  test('TC-ADM-01: should display System Users list', async ({ page }) => {
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('User Management');
    await expect(page.locator('.oxd-table-header')).toBeVisible();
    await expect(page.locator('.oxd-table-card').first()).toBeVisible();
  });

  // TC-ADM-02
  test('TC-ADM-02: should open Add System User form', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForURL(/saveSystemUser/);
    await expect(page.locator('h6', { hasText: 'Add User' })).toBeVisible();
  });

  // TC-ADM-03
  test('TC-ADM-03: should validate required fields on Add User form', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForURL(/saveSystemUser/);
    await waitForPageReady(page);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.oxd-input-field-error-message').first()).toBeVisible();
  });

  // TC-ADM-04
  test('TC-ADM-04: should search system users by username', async ({ page }) => {
    await page.locator('.oxd-table-filter-area input').first().fill('Admin');
    await page.locator('button[type="submit"]').click();
    await waitForPageReady(page);
    await expect(page.locator('.oxd-table-card').first()).toBeVisible();
    await expect(page.locator('.oxd-table-card').first()).toContainText('Admin');
  });

  // TC-ADM-05
  test('TC-ADM-05: should navigate to Job Titles page', async ({ page }) => {
    await openPage(page, ROUTES.adminJobTitles);
    await expect(page.locator('.oxd-table-header')).toBeVisible();
  });

  // TC-ADM-06
  test('TC-ADM-06: should navigate to Pay Grades page', async ({ page }) => {
    await openPage(page, ROUTES.adminPayGrades);
    await expect(page.locator('.orangehrm-container')).toBeVisible();
  });

  // TC-ADM-07
  test('TC-ADM-07: should navigate to Organization Locations', async ({ page }) => {
    await openPage(page, ROUTES.adminLocations);
    await expect(page.locator('.oxd-table-header')).toBeVisible();
  });

  // TC-ADM-08
  test('TC-ADM-08: should display all Admin top-nav sections', async ({ page }) => {
    const adminSections = ['User Management', 'Job', 'Organization', 'Qualifications', 'Nationalities', 'Configuration'];
    for (const section of adminSections) {
      await expect(topNavTab(page, section)).toBeVisible();
    }
  });
});
