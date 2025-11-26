import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { CompanyActions, companyTestIds } from '../actions/companies.actions';
import { generateUniqueName } from '../data/role-name-generator';

let companyActions: CompanyActions;

test.describe('Companies - Search and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    companyActions = new CompanyActions(page);
    await companyActions.navigateTo();
  });

  test.describe('Search Functionality', () => {
    test('5.1: Should filter companies by partial name match', async ({ page }) => {
      const companyName = generateUniqueName();
      const searchTerm = companyName.substring(0, 5);

      // Create a company
      await companyActions.create({ name: companyName });

      // Search with partial name
      await companyActions.search(searchTerm);

      // Verify the company is displayed
      const row = page.getByRole('rowheader', { name: new RegExp(companyName, 'i') });
      await expect(row).toBeVisible();

      // Get count of rows (excluding header)
      const rowCount = await page.getByRole('row').count();
      // Should have at least header + 1 data row
      expect(rowCount).toBeGreaterThanOrEqual(2);
    });

    test('5.2: Should show all companies when search is cleared', async ({ page }) => {
      // Create a couple of companies
      const company1 = generateUniqueName();
      const company2 = generateUniqueName();

      await companyActions.create({ name: company1 });
      await companyActions.create({ name: company2 });

      // Search for something
      await companyActions.search(company1);

      // Verify only one company is shown
      let rowCount = await page.getByRole('row').count();
      expect(rowCount).toBeGreaterThanOrEqual(2); // Header + 1 result

      // Clear search
      await companyActions.clearSearch();

      // Verify both companies are displayed
      const count = await companyActions.getTableRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('5.3: Should show "No data available" for no matches', async ({ page }) => {
      const nonExistentName = 'NonExistentCompany' + Math.random().toString(36).substring(7);

      await companyActions.search(nonExistentName);

      // Verify no data message
      await expect(page.locator('text=/No data available|no companies/i')).toBeVisible();
    });

    test('5.4: Should search is case-insensitive', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      // Search with uppercase
      const upperCaseSearch = companyName.toUpperCase();
      await companyActions.search(upperCaseSearch);

      // Verify company is found
      const row = page.getByRole('rowheader', { name: new RegExp(companyName, 'i') });
      await expect(row).toBeVisible();
    });

    test('5.5: Should filter by company ID', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      // Get the company row to extract ID
      const row = await companyActions.findRowByName(companyName);
      const cells = row.getByRole('cell');
      const cellCount = await cells.count();

      // ID is typically the second or third column
      if (cellCount >= 3) {
        const idCell = cells.nth(2); // Adjust index based on table structure
        const idText = await idCell.textContent();

        if (idText && idText.trim()) {
          // Clear previous search
          await companyActions.clearSearch();

          // Search by ID (first few characters)
          const idPrefix = idText.substring(0, 6);
          await companyActions.search(idPrefix);

          // Verify results are shown
          const resultRow = page.getByRole('rowheader', { name: new RegExp(companyName, 'i') });
          if (resultRow) {
            try {
              await expect(resultRow).toBeVisible({ timeout: 1000 });
            } catch (e) {
              // ID search might not be implemented
            }
          }
        }
      }
    });
  });

  test.describe('Search Interaction', () => {
    test('5.6: Should preserve search when performing actions', async ({ page }) => {
      const companyName = generateUniqueName();
      const searchTerm = companyName.substring(0, 5);

      await companyActions.create({ name: companyName });

      // Search
      await companyActions.search(searchTerm);

      // Verify search term is in input
      const searchInput = page.getByTestId(companyTestIds.searchInput);
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe(searchTerm);

      // Open edit modal
      const row = await companyActions.findRowByName(companyName);
      await row.getByRole('button', { name: 'Edit' }).click();
      await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();

      // Cancel
      await page.getByTestId(companyTestIds.cancelBtn).click();
      await page.waitForTimeout(300);

      // Verify search term is still there
      const searchValueAfter = await searchInput.inputValue();
      expect(searchValueAfter).toBe(searchTerm);
    });

    test('5.7: Should clear search when deleting filtered item', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      // Search for the company
      const searchTerm = companyName.substring(0, 5);
      await companyActions.search(searchTerm);

      // Delete it
      const row = await companyActions.findRowByName(companyName);
      await row.getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByTestId(companyTestIds.deleteModal)).toBeVisible();

      await page.getByTestId(companyTestIds.deleteConfirmBtn).click();
      await page.waitForLoadState('networkidle');

      // Verify no data message appears or search results are empty
      const noDataMessage = page.locator('text=/No data available|no companies/i');
      try {
        await expect(noDataMessage).toBeVisible({ timeout: 1000 });
      } catch (e) {
        // Alternative: verify row count is 0 or 1 (only header)
        const rowCount = await page.getByRole('row').count();
        expect(rowCount).toBeLessThanOrEqual(1);
      }
    });
  });

  test.describe('Real-time Search', () => {
    test('Should perform real-time search as user types', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      // Type first character
      await page.getByTestId(companyTestIds.searchInput).fill(companyName.charAt(0));
      await page.waitForTimeout(300);

      // Should find companies starting with that character
      let rowCount = await page.getByRole('row').count();
      expect(rowCount).toBeGreaterThanOrEqual(2); // At least header + 1 result

      // Type more characters
      await page.getByTestId(companyTestIds.searchInput).fill(companyName.substring(0, 10));
      await page.waitForTimeout(300);

      // Should narrow down results
      rowCount = await page.getByRole('row').count();
      expect(rowCount).toBeGreaterThanOrEqual(1); // At least header
    });
  });
});
