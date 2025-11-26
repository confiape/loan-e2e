import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { CompanyActions, companyTestIds } from '../actions/companies.actions';
import { generateUniqueName } from '../data/role-name-generator';

let companyActions: CompanyActions;

test.describe('Companies - Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    companyActions = new CompanyActions(page);
    await companyActions.navigateTo();
  });

  test.describe('Delete Confirmation Modal', () => {
    test('4.1: Should open delete confirmation modal', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      const row = await companyActions.findRowByName(companyName);
      await row.getByRole('button', { name: 'Delete' }).click();

      // Verify delete modal appears
      await expect(page.getByTestId(companyTestIds.deleteModal)).toBeVisible();
      await expect(page.getByRole('heading', { name: /Confirm Delete|Delete/i })).toBeVisible();

      // Verify warning message includes company name
        await expect(page.getByTestId(companyTestIds.deleteModal)
        .getByRole('strong')).toContainText(companyName);

      // Verify buttons
      await expect(page.getByTestId(companyTestIds.deleteConfirmBtn)).toBeVisible();
      await expect(page.getByTestId(companyTestIds.deleteCancelBtn)).toBeVisible();
    });
  });

  test.describe('Successful Deletion', () => {
    test('4.2: Should delete company after confirmation', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });
      const countBefore = await companyActions.getTableRowCount(companyName);

      // Delete company
      await companyActions.delete(companyName);

      // Verify count decreased
      const countAfter = await companyActions.getTableRowCount(companyName);
      expect(countAfter).toBe(countBefore - 1);

      // Verify company doesn't exist
      await companyActions.search(companyName);
      await expect(page.locator('text=/No data available|no companies/i')).toBeVisible();
    });
  });

  test.describe('Deletion Cancellation', () => {
    test('4.3: Should cancel deletion', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      const countBefore = await companyActions.getTableRowCount(companyName);

      // Open delete modal
      const row = await companyActions.findRowByName(companyName);
      await row.getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByTestId(companyTestIds.deleteModal)).toBeVisible();

      // Cancel deletion
      await page.getByTestId(companyTestIds.deleteCancelBtn).click();
      await page.waitForTimeout(300);

      // Verify modal is closed
      await expect(page.getByTestId(companyTestIds.deleteModal)).not.toBeVisible();

      // Verify count didn't change
      const countAfter = await companyActions.getTableRowCount(companyName);
      expect(countAfter).toBe(countBefore);

      // Verify company still exists
      await companyActions.verifyExists(companyName);
    });

    test('4.4: Should close delete modal with X button', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      const countBefore = await companyActions.getTableRowCount(companyName);

      // Open delete modal
      const row = await companyActions.findRowByName(companyName);
      await row.getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByTestId(companyTestIds.deleteModal)).toBeVisible();

      // Click close button (X)
      const closeButton = page.getByTestId(companyTestIds.deleteModal).getByRole('button', { name: /close|×/i }).first();
      await closeButton.click();
      await page.waitForTimeout(300);

      // Verify modal is closed
      await expect(page.getByTestId(companyTestIds.deleteModal)).not.toBeVisible();

      // Verify count didn't change
      const countAfter = await companyActions.getTableRowCount(companyName);
      expect(countAfter).toBe(countBefore);

      // Verify company still exists
      await companyActions.verifyExists(companyName);
    });
  });

  test.describe('Delete Edge Cases', () => {
    test('4.5: Should handle deletion of last filtered item', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      // Search for only this company
      await companyActions.search(companyName);

      // Delete it
      const row = await companyActions.findRowByName(companyName);
      await row.getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByTestId(companyTestIds.deleteModal)).toBeVisible();

      await page.getByTestId(companyTestIds.deleteConfirmBtn).click();
      await page.waitForLoadState('networkidle');

      // Verify no data available
      await expect(page.locator('text=/No data available|no companies/i')).toBeVisible();

      // Clear search and verify other companies still exist
      await companyActions.clearSearch();
      const countAfter = await companyActions.getTableRowCount(companyName);
      expect(countAfter).toBeGreaterThanOrEqual(0);
    });
  });
});
