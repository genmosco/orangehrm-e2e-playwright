// utils/helpers.js
// Reusable helpers for common OrangeHRM interactions.
//
// Timing approach: never wait for 'networkidle' (the demo site keeps background
// requests going, so it is slow and unreliable). Instead, wait for the specific
// element a test needs, and for OrangeHRM's loading spinner to disappear.

const { expect } = require('@playwright/test');

/**
 * Waits until an OrangeHRM page has rendered and finished loading its data.
 * @param {import('@playwright/test').Page} page
 */
async function waitForPageReady(page) {
  await expect(page.locator('.oxd-topbar-header-breadcrumb')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.oxd-loading-spinner')).toHaveCount(0, { timeout: 30000 });
}

/**
 * Opens a route and waits until the page is ready.
 * @param {import('@playwright/test').Page} page
 * @param {string} route  e.g. ROUTES.pim
 */
async function openPage(page, route) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await waitForPageReady(page);
}

/**
 * Logs in to OrangeHRM with the given credentials.
 * @param {import('@playwright/test').Page} page
 */
async function login(page, username, password) {
  await page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard/**', { timeout: 30000 });
}

/**
 * Locator for a top navigation tab (the bar under the page title).
 * @param {import('@playwright/test').Page} page
 * @param {string} name  e.g. 'Entitlements', 'Configure'
 */
function topNavTab(page, name) {
  return page.locator('.oxd-topbar-body-nav-tab', { hasText: name }).first();
}

/**
 * Opens a top-nav dropdown (e.g. Performance > Configure) and clicks one of its items.
 * In OrangeHRM these menus open on click, not hover, and their items only exist once open.
 * @param {import('@playwright/test').Page} page
 * @param {string} tabName   e.g. 'Configure'
 * @param {string} itemName  e.g. 'KPIs'
 */
async function openTopNavItem(page, tabName, itemName) {
  await topNavTab(page, tabName).click();
  const item = page.locator('.oxd-dropdown-menu').getByText(itemName, { exact: true });
  await expect(item).toBeVisible();
  await item.click();
}

/**
 * Selects a value from an OrangeHRM dropdown (custom oxd-select component).
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} wrapper  the .oxd-select-wrapper element
 * @param {string} [optionText]  option to pick; omit to pick the first real option
 */
async function selectDropdownOption(page, wrapper, optionText) {
  await wrapper.click();
  const options = page.locator('.oxd-select-dropdown .oxd-select-option');
  const option = optionText
    ? options.filter({ hasText: optionText }).first()
    : options.filter({ hasNotText: '-- Select --' }).first();
  await expect(option).toBeVisible();
  await option.click();
}

/**
 * Fills an OrangeHRM date field.
 * The display format depends on the site's localisation settings (the demo
 * currently uses yyyy-dd-mm), so the format is read from the field's placeholder.
 * @param {import('@playwright/test').Locator} input
 * @param {string} isoDate  date as YYYY-MM-DD
 */
async function fillDateInput(input, isoDate) {
  const [year, month, day] = isoDate.split('-');
  const placeholder = ((await input.getAttribute('placeholder')) || 'yyyy-mm-dd').toLowerCase();
  const formatted = placeholder
    .replace('yyyy', year)
    .replace('mm', month)
    .replace('dd', day);
  await input.fill(formatted);
  await input.press('Tab');
}

/**
 * Waits for a toast message (e.g. "Successfully Saved").
 * @param {import('@playwright/test').Page} page
 * @param {string} [text]
 */
async function waitForToast(page, text) {
  const toast = page.locator('.oxd-toast');
  await expect(toast.first()).toBeVisible({ timeout: 15000 });
  if (text) await expect(toast.first()).toContainText(text);
  return toast;
}

/**
 * Types into an autocomplete field (e.g. Employee Name) and picks the first suggestion.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} input
 * @param {string} text
 */
async function pickAutocomplete(page, input, text) {
  await input.fill(text);
  const option = page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option')
    .filter({ hasNotText: 'Searching' })
    .first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.click();
}

/**
 * The "No Records Found" label above a results table.
 * (An info toast shows the same words, so this targets only the table's <span>.)
 * @param {import('@playwright/test').Page} page
 */
function noRecordsLabel(page) {
  return page.locator('span.oxd-text--span', { hasText: /^No Records Found$/ });
}

/**
 * Locator that matches either the first result row or the "No Records Found" label,
 * for searches on shared demo data where either outcome is valid.
 * @param {import('@playwright/test').Page} page
 * @param {string} rowSelector  e.g. '.oxd-table-card'
 */
function resultsOrNoRecords(page, rowSelector) {
  return page.locator(rowSelector).first().or(noRecordsLabel(page)).first();
}

module.exports = {
  waitForPageReady,
  openPage,
  login,
  topNavTab,
  openTopNavItem,
  selectDropdownOption,
  fillDateInput,
  waitForToast,
  pickAutocomplete,
  noRecordsLabel,
  resultsOrNoRecords,
};
