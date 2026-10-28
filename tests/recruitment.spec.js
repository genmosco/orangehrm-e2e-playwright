// tests/recruitment.spec.js
// TC-REC-01 through TC-REC-07
// Tests: Job vacancies, add vacancy, candidates list, add candidate

const { test, expect } = require('@playwright/test');
const { ROUTES } = require('../utils/constants');
const { openPage, waitForPageReady, topNavTab } = require('../utils/helpers');

test.describe('Recruitment', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, ROUTES.recruitment);
  });

  // TC-REC-01: Vacancies list loads
  test('TC-REC-01: should display Job Vacancies list', async ({ page }) => {
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Recruitment');
    await expect(page.locator('.oxd-table')).toBeVisible();
  });

  // TC-REC-02: Sub-navigation contains Vacancies and Candidates
  test('TC-REC-02: should show Recruitment sub-nav items', async ({ page }) => {
    await expect(topNavTab(page, 'Vacancies')).toBeVisible();
    await expect(topNavTab(page, 'Candidates')).toBeVisible();
  });

  // TC-REC-03: Add Job Vacancy form loads
  test('TC-REC-03: should open the Add Job Vacancy form', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForURL(/addJobVacancy/);
    await waitForPageReady(page);
    await expect(page.locator('h6', { hasText: 'Add Vacancy' })).toBeVisible();
    await expect(page.locator('input.oxd-input').first()).toBeVisible();
  });

  // TC-REC-04: Add Vacancy form validation on empty submit
  test('TC-REC-04: should validate required fields on Add Vacancy form', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForURL(/addJobVacancy/);
    await waitForPageReady(page);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.oxd-input-field-error-message').first()).toBeVisible();
  });

  // TC-REC-05: Candidates list page loads
  test('TC-REC-05: should display Candidates list', async ({ page }) => {
    await topNavTab(page, 'Candidates').click();
    await page.waitForURL(/viewCandidates/);
    await waitForPageReady(page);
    await expect(page.locator('.oxd-table-header')).toBeVisible();
  });

  // TC-REC-06: Add Candidate form accessible from Candidates page
  test('TC-REC-06: should open Add Candidate form', async ({ page }) => {
    await topNavTab(page, 'Candidates').click();
    await page.waitForURL(/viewCandidates/);
    await waitForPageReady(page);
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForURL(/addCandidate/);
    await expect(page.locator('h6', { hasText: 'Add Candidate' })).toBeVisible();
  });

  // TC-REC-07: Add Candidate form contains required fields
  test('TC-REC-07: should display required fields on Add Candidate form', async ({ page }) => {
    await topNavTab(page, 'Candidates').click();
    await page.waitForURL(/viewCandidates/);
    await waitForPageReady(page);
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForURL(/addCandidate/);

    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('.oxd-select-wrapper').first()).toBeVisible(); // Vacancy
  });
});
