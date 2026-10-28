// tests/myinfo.spec.js
// TC-INFO-01 through TC-INFO-05
// Tests: My Info page structure, tabs and Change Password

const { test, expect } = require('@playwright/test');
const { ROUTES } = require('../utils/constants');
const { openPage, waitForPageReady } = require('../utils/helpers');

test.describe('My Info', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, ROUTES.myInfo);
  });

  // TC-INFO-01: My Info page loads
  test('TC-INFO-01: should display My Info Personal Details page', async ({ page }) => {
    await expect(page.locator('h6', { hasText: 'Personal Details' })).toBeVisible();
  });

  // TC-INFO-02: Personal Details fields are editable
  test('TC-INFO-02: should display editable personal detail fields', async ({ page }) => {
    await expect(page.locator('input[name="firstName"]')).toBeEditable();
    await expect(page.locator('input[name="lastName"]')).toBeEditable();
  });

  // TC-INFO-03: Contact Details tab accessible
  test('TC-INFO-03: should navigate to Contact Details tab', async ({ page }) => {
    await page.locator('.orangehrm-tabs-wrapper a', { hasText: 'Contact Details' }).click();
    await page.waitForURL(/contactDetails/);
    await expect(page.locator('h6', { hasText: 'Contact Details' })).toBeVisible();
  });

  // TC-INFO-04: Change Password option accessible
  test('TC-INFO-04: should open Change Password from user dropdown', async ({ page }) => {
    await page.locator('.oxd-userdropdown-tab').click();
    await page.locator('.oxd-userdropdown-link', { hasText: 'Change Password' }).click();
    await page.waitForURL(/updatePassword/);
    await waitForPageReady(page);
    await expect(page.locator('h6', { hasText: 'Update Password' })).toBeVisible();
    await expect(page.locator('.oxd-form')).toBeVisible();
  });

  // TC-INFO-05: Emergency Contacts tab accessible
  test('TC-INFO-05: should navigate to Emergency Contacts tab', async ({ page }) => {
    await page.locator('.orangehrm-tabs-wrapper a', { hasText: 'Emergency Contacts' }).click();
    await page.waitForURL(/viewEmergencyContacts/);
    await waitForPageReady(page);
    await expect(page.locator('h6', { hasText: 'Assigned Emergency Contacts' })).toBeVisible();
  });
});
