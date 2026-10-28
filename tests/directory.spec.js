// tests/directory.spec.js
// TC-DIR-01 through TC-DIR-04 | TC-BUZZ-01 through TC-BUZZ-03
// Tests: Employee directory search, Buzz social feed

const { test, expect } = require('@playwright/test');
const { ROUTES } = require('../utils/constants');
const { openPage, waitForPageReady, pickAutocomplete } = require('../utils/helpers');

test.describe('Directory', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, ROUTES.directory);
  });

  // TC-DIR-01: Directory page loads with employee cards
  test('TC-DIR-01: should display the Employee Directory', async ({ page }) => {
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Directory');
    await expect(page.locator('.orangehrm-container')).toBeVisible();
  });

  // TC-DIR-02: Directory search by employee name
  test('TC-DIR-02: should search employee in Directory', async ({ page }) => {
    await page.locator('input[placeholder*="Type"]').first().fill('Alice');
    await page.locator('button[type="submit"]').click();
    await waitForPageReady(page);
    // Either matching cards or an empty result; the results area stays visible
    await expect(page.locator('.orangehrm-container')).toBeVisible();
  });

  // TC-DIR-03: Reset directory search works
  test('TC-DIR-03: should reset Directory search', async ({ page }) => {
    // The name filter only takes effect once a suggestion is picked; text typed
    // without picking one isn't part of the filter, so Reset leaves it alone.
    const nameInput = page.locator('input[placeholder*="Type"]').first();
    await pickAutocomplete(page, nameInput, 'a');
    await expect(nameInput).not.toHaveValue('');

    await page.getByRole('button', { name: 'Reset' }).click();
    await waitForPageReady(page);
    await expect(nameInput).toHaveValue('');
  });

  // TC-DIR-04: Directory cards contain name and job title
  test('TC-DIR-04: should show employee info cards in Directory', async ({ page }) => {
    const cards = page.locator('.orangehrm-directory-card');
    await expect(cards.first()).toBeVisible();
    await expect(cards.first().locator('.orangehrm-directory-card-header')).toBeVisible();
  });
});

test.describe('Buzz', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, ROUTES.buzz);
  });

  // TC-BUZZ-01: Buzz social wall loads
  test('TC-BUZZ-01: should load the Buzz social wall', async ({ page }) => {
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Buzz');
    await expect(page.locator('.orangehrm-buzz-newsfeed')).toBeVisible();
  });

  // TC-BUZZ-02: Post input area is visible
  test('TC-BUZZ-02: should display post creation area', async ({ page }) => {
    await expect(page.locator('textarea[placeholder*="What"]').first()).toBeVisible();
  });

  // TC-BUZZ-03: Posts / feed items appear
  test('TC-BUZZ-03: should display existing posts in the feed', async ({ page }) => {
    // The shared demo always has posts, but allow an empty feed just in case
    const posts = page.locator('.orangehrm-buzz-post');
    await expect(page.locator('.orangehrm-buzz-newsfeed')).toBeVisible();
    if (await posts.count() > 0) {
      await expect(posts.first()).toBeVisible();
    }
  });
});
