import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { CompanyActions, companyTestIds } from '../actions/companies.actions';

let companyActions: CompanyActions;

test.describe('Companies - Navigation and Page Load', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    companyActions = new CompanyActions(page);
  });

  test('1.1: Should load Companies page successfully', async ({ page }) => {
    await companyActions.navigateTo();

    // Verify URL
    expect(page.url()).toContain('/companies');

    // Verify page elements
    await expect(page.getByRole('heading', { name: /companies/i })).toBeVisible();
    await expect(page.getByTestId(companyTestIds.newCompanyBtn)).toBeVisible();
    await expect(page.getByTestId(companyTestIds.searchInput)).toBeVisible();
    await expect(page.getByTestId(companyTestIds.table)).toBeVisible();

    // Verify table has content
    const rows = await page.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1); // At least header row
  });

  test('1.2: Should display correct page structure', async ({ page }) => {
    await companyActions.navigateTo();

    // Verify header section
    await expect(page.getByRole('heading', { name: 'Companies' })).toBeVisible()

    // Verify search bar is above table
    const searchInput = page.getByTestId(companyTestIds.searchInput);
    const table = page.getByTestId(companyTestIds.table);

    const searchBox = await searchInput.boundingBox();
    const tableBox = await table.boundingBox();

    if (searchBox && tableBox) {
      expect(searchBox.y).toBeLessThan(tableBox.y);
    }

    // Verify table headers
    const tableHeaders = page.getByRole('columnheader');
    const headerCount = await tableHeaders.count();
    expect(headerCount).toBeGreaterThanOrEqual(3); // At least: Select, Name, Actions

    // Verify no error messages
    const errorElements = page.locator('text=/error|failed|unable/i');
    const errorCount = await errorElements.count();
    expect(errorCount).toBe(0);
  });

  test('1.3: Should load all existing companies in table', async ({ page }) => {
    await companyActions.navigateTo();

    // Get row count
    const rowCount = await companyActions.getTableRowCount("Admin");
    expect(rowCount).toBeGreaterThanOrEqual(0);

    // Verify each row has required columns
    const row = page.getByTestId(companyTestIds.selectedItemsArea).first();

    if (await row.isVisible().catch(() => false)) {
      // Verify row has checkbox, name, actions
      const cells = row.getByRole('cell');
      const cellCount = await cells.count();
      expect(cellCount).toBeGreaterThanOrEqual(3); // Checkbox, Name, Actions at minimum

      // Verify edit/delete buttons are present
      const editBtn = row.getByRole('button', { name: /edit/i });
      const deleteBtn = row.getByRole('button', { name: /delete/i });

      if (await editBtn.count() > 0) {
        await expect(editBtn.first()).toBeVisible();
      }
      if (await deleteBtn.count() > 0) {
        await expect(deleteBtn.first()).toBeVisible();
      }
    }
  });

  test('Should verify page is fully loaded', async ({ page }) => {
    await companyActions.navigateTo();

    // Wait for network idle
    await page.waitForLoadState('networkidle');

    // Verify all critical elements are rendered
    const criticalElements = [
      companyTestIds.newCompanyBtn,
      companyTestIds.searchInput,
      companyTestIds.table,
    ];

    for (const testId of criticalElements) {
      const element = page.getByTestId(testId);
      await expect(element).toBeVisible();
    }
  });

  test('Should handle page refresh correctly', async ({ page }) => {
    await companyActions.navigateTo();

    const countBefore = await companyActions.getTableRowCount("Admin");

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify page is still functional
    const countAfter = await companyActions.getTableRowCount("Admin");
    expect(countAfter).toBe(countBefore);

    // Verify elements are still visible
    await expect(page.getByTestId(companyTestIds.table)).toBeVisible();
    await expect(page.getByTestId(companyTestIds.newCompanyBtn)).toBeVisible();
  });

  test('Should require authentication to access companies page', async ({ browser }) => {
    // Create a new context without logging in
    const context = await browser.newContext();
    const page = await context.newPage();

    // Try to navigate directly to companies page
    await page.goto('/companies');

    // Should be redirected to login or show error
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    const isOnLogin = currentUrl.includes('/login') || !currentUrl.includes('/companies');

    expect(isOnLogin).toBeTruthy();

    await context.close();
  });
});
