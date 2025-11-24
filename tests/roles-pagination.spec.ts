// spec: Roles Pagination Testing
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';

test.describe('Roles Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
  });

  test('Navigate to Next Page', async ({ page }) => {
    // Click Next button to navigate to page 2
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify pagination counter shows 11-20 after clicking Next
    await expect(page.getByText(/Showing 11-20 of \d+/)).toBeVisible();

    // Verify Previous button is enabled on page 2
    await expect(page.getByRole('button', { name: 'Previous' })).toBeEnabled();

    // Verify different roles are shown on page 2
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible();
  });

  test('Navigate to Previous Page', async ({ page }) => {
    // Click Next then Previous
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(/Showing 11-20 of \d+/)).toBeVisible();

    // Click Previous button to navigate back to page 1
    await page.getByRole('button', { name: 'Previous' }).click();

    // Verify back on page 1 after clicking Previous
    await expect(page.getByText(/Showing 1-10 of \d+/)).toBeVisible();

    // Verify Previous disabled again
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  test('Previous Disabled on First Page', async ({ page }) => {
    // Verify "Previous" button is disabled on page 1
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  test('Next Disabled on Last Page', async ({ page }) => {
    // Navigate to last page by clicking Next multiple times
    const nextButton = page.getByRole('button', { name: 'Next' });
    
    // Keep clicking Next until it's disabled
    while (await nextButton.isEnabled()) {
      await nextButton.click();
      // Wait for the page to update
      await page.waitForLoadState('networkidle');
    }

    // Verify Next button is disabled on last page
    await expect(nextButton).toBeDisabled();

    // Verify we're on the last page
    await expect(page.getByText(/Showing \d+-\d+ of \d+/)).toBeVisible();
  });

  test('Pagination Counter Updates Correctly', async ({ page }) => {
    // Verify initial counter shows 1-10
    await expect(page.getByText(/Showing 1-10 of \d+/)).toBeVisible();

    // Navigate to page 2
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(/Showing 11-20 of \d+/)).toBeVisible();

    // Navigate to page 3
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(/Showing 21-30 of \d+/)).toBeVisible();

    // Navigate to page 4
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(/Showing 31-40 of \d+/)).toBeVisible();
  });

  test('Pagination with Search', async ({ page }) => {
    // Create 15 roles: "PageSearch1" to "PageSearch15"
    for (let i = 1; i <= 15; i++) {
      await page.getByTestId('roles-btn-new').click();
      await page.getByTestId('roles-input-name').fill(`PageSearch${i}`);
      await page.getByTestId('roles-btn-submit').click();
    }

    // Search for "PageSearch"
    await page.getByTestId('roles-search-input').fill('PageSearch');

    // Verify pagination shows filtered count (15)
    await expect(page.getByText('Showing 1-10 of 15')).toBeVisible();

    // Navigate between pages
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify works on filtered data
    await expect(page.getByText('Showing 11-15 of 15')).toBeVisible();

    // Verify some roles from page 2
    await expect(page.getByText('PageSearch11')).toBeVisible();

    // Navigate back
    await page.getByRole('button', { name: 'Previous' }).click();
    await expect(page.getByText('Showing 1-10 of 15')).toBeVisible();
  });
});
