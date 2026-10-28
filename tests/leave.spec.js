// tests/leave.spec.js
// TC-LEAVE-01 through TC-LEAVE-05
// Tests: Assign leave form, assign leave end to end, validation, entitlements, date filter

const { test, expect } = require('@playwright/test');
const { ROUTES, TEST_DATA, workingDayPair } = require('../utils/constants');
const {
  openPage, waitForPageReady, openTopNavItem, selectDropdownOption,
  fillDateInput,
} = require('../utils/helpers');

/**
 * On the Assign Leave form, tries employee suggestions and leave types until the form's
 * "Leave Balance" shows at least `minDays`. Leaves that employee and type selected.
 * @returns {Promise<{employee: string, leaveType: string, balance: number} | null>}
 */
async function findEmployeeWithLeaveBalance(page, minDays, maxEmployees = 5) {
  const employeeInput = page.locator('input[placeholder="Type for hints..."]');
  const suggestions = page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option')
    .filter({ hasNotText: 'Searching' });
  const leaveTypeSelect = page.locator('.oxd-select-wrapper').first();
  const typeOptions = page.locator('.oxd-select-dropdown .oxd-select-option')
    .filter({ hasNotText: '-- Select --' });
  const balanceField = page.locator('.oxd-input-group', { hasText: 'Leave Balance' });

  for (let e = 0; e < maxEmployees; e++) {
    await employeeInput.fill('a');
    await expect(suggestions.first()).toBeVisible({ timeout: 15000 });
    if (e >= await suggestions.count()) break;
    const employee = ((await suggestions.nth(e).textContent()) || '').replace(/\s+/g, ' ').trim();
    await suggestions.nth(e).click();

    await leaveTypeSelect.click();
    await expect(typeOptions.first()).toBeVisible();
    const typeCount = await typeOptions.count();

    for (let t = 0; t < typeCount; t++) {
      if (t > 0) {
        await leaveTypeSelect.click();
        await expect(typeOptions.first()).toBeVisible();
      }
      const leaveType = ((await typeOptions.nth(t).textContent()) || '').trim();
      // Selecting a type makes the form fetch that balance; wait for the answer
      const balanceLoaded = page.waitForResponse((r) => r.url().includes('/leave-balance/'));
      await typeOptions.nth(t).click();
      await balanceLoaded;
      await expect(balanceField).toContainText(/Day/);

      const balance = parseFloat(((await balanceField.textContent()) || '').match(/(-?[\d.]+)\s*Day/)?.[1] || '0');
      if (balance >= minDays) return { employee, leaveType, balance };
    }
  }
  return null;
}

test.describe('Leave Management', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, ROUTES.leave);
  });

  // TC-LEAVE-01: Assign Leave form loads correctly
  test('TC-LEAVE-01: should open the Assign Leave form', async ({ page }) => {
    await page.locator('.oxd-topbar-body-nav-tab', { hasText: 'Assign Leave' }).click();
    await page.waitForURL(/assignLeave/);
    await expect(page.locator('h6', { hasText: 'Assign Leave' })).toBeVisible();
    await expect(page.locator('.oxd-form')).toBeVisible();
  });

  // TC-LEAVE-02: Fill and submit the Assign Leave form
  test('TC-LEAVE-02: should fill and submit the Assign Leave form', async ({ page }) => {
    const { firstDaysAhead, maxAttempts, comment } = TEST_DATA.leave;
    await openPage(page, ROUTES.leaveAssign);

    // Leave can only be assigned against an entitlement, and the shared demo's data changes,
    // so find an employee and leave type that currently have at least 1 day of balance.
    const found = await findEmployeeWithLeaveBalance(page, 1);
    test.skip(!found, 'No employee with leave balance on the shared demo right now');
    test.info().annotations.push({ type: 'leave', description: `${found.employee} / ${found.leaveType} (${found.balance} days)` });

    await page.locator('textarea').fill(comment);

    const dates = page.locator('.oxd-date-input input');
    const toast = page.locator('.oxd-toast').first();
    const confirmDialog = page.locator('.oxd-dialog-sheet').first();

    // Holidays on the shared demo can change, so if a date window has no working days,
    // the site says so and the test tries the following week instead.
    let outcome = '';
    let daysAhead = firstDaysAhead;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { start, end } = workingDayPair(daysAhead);
      // Next attempt: one week after this window
      daysAhead = Math.ceil((new Date(`${start}T12:00`) - Date.now()) / 86_400_000) + 7;
      await fillDateInput(dates.nth(0), start);
      await fillDateInput(dates.nth(1), end);

      // A range of more than one day shows Partial Days; then pick a half-day duration
      await selectDropdownOption(page, page.locator('.oxd-select-wrapper').nth(1), 'All Days');
      await selectDropdownOption(page, page.locator('.oxd-select-wrapper').nth(2), 'Half Day - Morning');

      await page.getByRole('button', { name: 'Assign' }).click();

      // Outcome: a toast, or a confirmation dialog (e.g. if the balance changed meanwhile)
      await expect(toast.or(confirmDialog).first()).toBeVisible({ timeout: 20000 });
      if (await confirmDialog.isVisible()) {
        outcome = 'confirm';
        break;
      }
      outcome = (await toast.textContent()) || '';
      if (!/No Working Days/i.test(outcome)) break;

      test.info().annotations.push({ type: 'retry-dates', description: `${start} to ${end} had no working days` });
      await expect(toast).toBeHidden({ timeout: 15000 });
    }

    if (outcome === 'confirm') {
      await confirmDialog.getByRole('button', { name: /ok|confirm/i }).first().click();
      await expect(toast).toBeVisible({ timeout: 20000 });
    }
    await expect(toast).toContainText(/Success/i);
  });

  // TC-LEAVE-03: Validation fires when submitting an empty Assign Leave form
  test('TC-LEAVE-03: should show validation errors on empty Assign Leave submit', async ({ page }) => {
    await openPage(page, ROUTES.leaveAssign);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.oxd-input-field-error-message').first()).toBeVisible();
  });

  // TC-LEAVE-04: Add Entitlements page opens from the Entitlements menu
  test('TC-LEAVE-04: should load the Add Entitlements page', async ({ page }) => {
    // "Entitlements" is a dropdown; its items only exist once it is opened
    await openTopNavItem(page, 'Entitlements', 'Add Entitlements');
    await page.waitForURL(/addLeaveEntitlement/);
    await waitForPageReady(page);
    await expect(page.locator('.oxd-form')).toBeVisible();
  });

  // TC-LEAVE-05: Leave list filter by date range
  test('TC-LEAVE-05: should filter Leave List by date range', async ({ page }) => {
    const { fromDate, toDate } = TEST_DATA.leaveFilter;
    const dates = page.locator('.oxd-date-input input');
    await fillDateInput(dates.nth(0), fromDate);
    await fillDateInput(dates.nth(1), toDate);

    // A wrongly formatted date shows a validation message instead of filtering
    await expect(page.locator('.oxd-input-field-error-message')).toHaveCount(0);

    await page.locator('button[type="submit"]').click();
    await waitForPageReady(page);
    await expect(page.locator('.oxd-table')).toBeVisible();
  });
});
