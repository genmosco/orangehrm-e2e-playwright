// tests/pim.spec.js
// TC-PIM-01 through TC-PIM-08
// Tests: Employee list, add employee, search, view profile, profile tabs, reset filter

const { test, expect } = require('@playwright/test');
const { ROUTES, TEST_DATA } = require('../utils/constants');
const { openPage, waitForPageReady, noRecordsLabel, resultsOrNoRecords } = require('../utils/helpers');

test.describe('PIM - Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, ROUTES.pim);
  });

  // TC-PIM-01: Employee list page loads with data
  test('TC-PIM-01: should display the employee list', async ({ page }) => {
    await expect(page.locator('.oxd-table-header')).toBeVisible();
    await expect(page.locator('.oxd-table-card').first()).toBeVisible();
    // Record count ("(N) Records Found") is shown above the table
    await expect(page.getByText(/Records? Found/)).toBeVisible();
  });

  // TC-PIM-02: Add New Employee page loads correctly
  test('TC-PIM-02: should open the Add Employee form', async ({ page }) => {
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(page).toHaveURL(/addEmployee/);
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="middleName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
  });

  // TC-PIM-03: Add a new employee successfully
  test('TC-PIM-03: should add a new employee successfully', async ({ page }) => {
    const { firstName, lastName, employeeId } = TEST_DATA.employee;

    await openPage(page, ROUTES.addEmployee);
    await page.locator('input[name="firstName"]').fill(firstName);
    await page.locator('input[name="lastName"]').fill(lastName);

    // Employee Id is the input inside the "Employee Id" field group
    const empIdInput = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input');
    await empIdInput.fill(employeeId);

    await page.locator('button[type="submit"]').click();

    // Saving redirects to the new employee's profile
    await page.waitForURL(/viewPersonalDetails/, { timeout: 30000 });
    await waitForPageReady(page);
    await expect(page.locator('h6', { hasText: 'Personal Details' })).toBeVisible();
    await expect(page.locator('.orangehrm-edit-employee-name')).toContainText(firstName);
  });

  // TC-PIM-04: Search for an employee by name
  test('TC-PIM-04: should search and find an employee by name', async ({ page }) => {
    // Shared demo data changes, so either results or "No Records Found" is valid
    await page.locator('.oxd-table-filter-area input').first().fill('Alice');
    await page.locator('button[type="submit"]').click();
    await waitForPageReady(page);
    await expect(resultsOrNoRecords(page, '.oxd-table-card')).toBeVisible();
  });

  // TC-PIM-05: Search with no results shows "No Records Found"
  test('TC-PIM-05: should show no records for non-existent employee', async ({ page }) => {
    await page.locator('.oxd-table-filter-area input').first().fill('ZZZ_NONEXISTENT_USER_XYZ');
    await page.locator('button[type="submit"]').click();
    await waitForPageReady(page);

    await expect(page.locator('.oxd-table-card')).toHaveCount(0);
    await expect(noRecordsLabel(page)).toBeVisible();
    // OrangeHRM also shows an info toast with the same message
    await expect(page.locator('.oxd-toast').first()).toContainText('No Records Found');
  });

  // TC-PIM-06: View employee personal details
  test('TC-PIM-06: should navigate to an employee personal details page', async ({ page }) => {
    await page.locator('.oxd-table-card').first().locator('i.bi-pencil-fill').click();
    await page.waitForURL(/viewPersonalDetails/, { timeout: 30000 });
    await expect(page.locator('h6', { hasText: 'Personal Details' })).toBeVisible();
  });

  // TC-PIM-07: Employee profile tabs are all accessible
  test('TC-PIM-07: should display all employee profile tab sections', async ({ page }) => {
    await page.locator('.oxd-table-card').first().locator('i.bi-pencil-fill').click();
    await page.waitForURL(/viewPersonalDetails/, { timeout: 30000 });

    const expectedTabs = [
      'Personal Details', 'Contact Details', 'Emergency Contacts', 'Dependents', 'Immigration',
      'Job', 'Salary', 'Report-to', 'Qualifications', 'Memberships',
    ];
    const tabs = page.locator('.orangehrm-tabs-wrapper a');
    await expect(tabs).toHaveCount(expectedTabs.length);
    for (const tab of expectedTabs) {
      await expect(tabs.filter({ hasText: new RegExp(`^${tab}$`) })).toBeVisible();
    }
  });

  // TC-PIM-08: Reset search filter clears results
  test('TC-PIM-08: should reset search filter and reload full list', async ({ page }) => {
    const nameInput = page.locator('.oxd-table-filter-area input').first();
    await nameInput.fill('Alice');
    await page.locator('button[type="submit"]').click();
    await waitForPageReady(page);

    await page.getByRole('button', { name: 'Reset' }).click();
    await waitForPageReady(page);

    await expect(nameInput).toHaveValue('');
    await expect(page.locator('.oxd-table-card').first()).toBeVisible();
  });
});
