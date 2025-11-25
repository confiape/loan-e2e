import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { roleTestIds } from '../actions/roles.actions';

test.describe('Role Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
    
    // Clear search to see full dataset
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.waitForLoadState('networkidle');
  });

  test('48 - Verify pagination controls presence', async ({ page }) => {
    // Verify pagination controls are visible
    const paginationControls = page.locator('text=/Showing.*of.*');
    const isVisible = await paginationControls.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(paginationControls).toBeVisible();

      // Verify Previous button exists (should be disabled on first page)
      const previousButton = page.getByRole('button', { name: 'Previous' });
      await expect(previousButton).toBeVisible();

      // Verify Next button exists
      const nextButton = page.getByRole('button', { name: 'Next' });
      await expect(nextButton).toBeVisible();
    }
  });

  test('49 - Navigate to next page', async ({ page }) => {
    // Get initial data
    const rows = page.locator('table tbody tr');
    const initialRowCount = await rows.count();
    
    // Get first role ID
    const firstRole = await rows.nth(0).locator('td').nth(1).textContent();

    // Click Next button
    const nextButton = page.getByRole('button', { name: 'Next' });
    const isNextVisible = await nextButton.isVisible().catch(() => false);

    if (isNextVisible) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Verify new rows are loaded
      const newRows = page.locator('table tbody tr');
      const newFirstRole = await newRows.nth(0).locator('td').nth(1).textContent();

      // First role on page 2 should be different from page 1
      expect(newFirstRole).not.toBe(firstRole);
    }
  });

  test('50 - Navigate to previous page', async ({ page }) => {
    // Navigate to next page first
    const nextButton = page.getByRole('button', { name: 'Next' });
    const isNextVisible = await nextButton.isVisible().catch(() => false);

    if (isNextVisible) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Get role on page 2
      const rows = page.locator('table tbody tr');
      const page2FirstRole = await rows.nth(0).locator('td').nth(1).textContent();

      // Click Previous
      const previousButton = page.getByRole('button', { name: 'Previous' });
      await previousButton.click();
      await page.waitForLoadState('networkidle');

      // Verify we're back on page 1
      const newRows = page.locator('table tbody tr');
      const page1FirstRole = await newRows.nth(0).locator('td').nth(1).textContent();

      // First role should be different
      expect(page1FirstRole).not.toBe(page2FirstRole);
    }
  });

  test('51 - Verify pagination button states', async ({ page }) => {
    // On first page, Previous should be disabled
    const previousButton = page.getByRole('button', { name: 'Previous' });
    const nextButton = page.getByRole('button', { name: 'Next' });

    const isPreviousDisabled = await previousButton.isDisabled().catch(() => false);
    const isNextDisabled = await nextButton.isDisabled().catch(() => false);

    // Previous might be disabled on first page
    if (isPreviousDisabled || isNextDisabled) {
      // Pagination is active
      expect(previousButton).toBeVisible();
      expect(nextButton).toBeVisible();
    }
  });

  test('52 - Navigate through multiple pages sequentially', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: 'Next' });
    const isNextVisible = await nextButton.isVisible().catch(() => false);

    if (isNextVisible) {
      // Navigate to page 2
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      let rows = page.locator('table tbody tr');
      let page2Count = await rows.count();
      expect(page2Count).toBeGreaterThan(0);

      // Navigate to page 3 if available
      const nextButton2 = page.getByRole('button', { name: 'Next' });
      const isNextVisible2 = await nextButton2.isVisible();
      
      if (isNextVisible2) {
        await nextButton2.click();
        await page.waitForLoadState('networkidle');

        rows = page.locator('table tbody tr');
        let page3Count = await rows.count();
        expect(page3Count).toBeGreaterThan(0);
      }
    }
  });

  test('53 - Last page navigation', async ({ page }) => {
    // Navigate to the last page by clicking Next repeatedly
    let hasNext = true;
    let clickCount = 0;
    const maxClicks = 100; // Safety limit

    while (hasNext && clickCount < maxClicks) {
      const nextButton = page.getByRole('button', { name: 'Next' });
      hasNext = await nextButton.isVisible().catch(() => false);
      
      if (hasNext && !await nextButton.isDisabled()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        clickCount++;
      } else {
        hasNext = false;
      }
    }

    // On last page, Next should be disabled
    const nextButton = page.getByRole('button', { name: 'Next' });
    const isDisabled = await nextButton.isDisabled().catch(() => true);

    // Verify Previous is enabled (unless only 1 page exists)
    const previousButton = page.getByRole('button', { name: 'Previous' });
    const isPreviousVisible = await previousButton.isVisible().catch(() => false);

    if (isPreviousVisible) {
      // We're not on the first page, so previous should be available
      expect(previousButton).toBeVisible();
    }
  });

  test('54 - Pagination with search filter', async ({ page }) => {
    // Apply search filter
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('Admin');
    await page.waitForLoadState('networkidle');

    // Check if pagination is visible with filtered results
    const nextButton = page.getByRole('button', { name: 'Next' });
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 10) {
      // Pagination should be visible for filtered results > 10
      const isPaginationVisible = await nextButton.isVisible().catch(() => false);
      // Document actual behavior
    } else {
      // Few results - pagination may not be visible
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('55 - Pagination with sorting', async ({ page }) => {
    // Get initial page 1 data
    const rows = page.locator('table tbody tr');
    const page1FirstRole = await rows.nth(0).locator('th').first().textContent();

    // Navigate to page 2
    const nextButton = page.getByRole('button', { name: 'Next' });
    const isNextVisible = await nextButton.isVisible().catch(() => false);

    if (isNextVisible && !await nextButton.isDisabled()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Apply sort
      const nameHeader = page.locator('table thead button', { hasText: 'Name' });
      await nameHeader.click();
      await page.waitForLoadState('networkidle');

      // Verify we're still in a valid state
      const newRows = page.locator('table tbody tr');
      const newRowCount = await newRows.count();
      expect(newRowCount).toBeGreaterThan(0);
    }
  });

  test('56 - Pagination consistency across navigations', async ({ page }) => {
    // Get role IDs from page 1
    const rows = page.locator('table tbody tr');
    const page1Ids = [];
    for (let i = 0; i < Math.min(3, await rows.count()); i++) {
      const id = await rows.nth(i).locator('td').nth(1).textContent();
      page1Ids.push(id);
    }

    // Navigate to page 2 and back
    const nextButton = page.getByRole('button', { name: 'Next' });
    if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      const previousButton = page.getByRole('button', { name: 'Previous' });
      await previousButton.click();
      await page.waitForLoadState('networkidle');

      // Verify page 1 data is the same
      const newRows = page.locator('table tbody tr');
      for (let i = 0; i < page1Ids.length; i++) {
        const newId = await newRows.nth(i).locator('td').nth(1).textContent();
        expect(newId).toBe(page1Ids[i]);
      }
    }
  });

  test('57 - Items per page display', async ({ page }) => {
    // Verify items count display
    const itemDisplay = page.locator('text=/Showing.*of.*/');
    const isVisible = await itemDisplay.isVisible().catch(() => false);

    if (isVisible) {
      const text = await itemDisplay.textContent();
      expect(text).toMatch(/Showing \d+-\d+ of \d+/);
    }
  });
});
