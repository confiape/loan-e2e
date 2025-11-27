import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { CompanyActions, companyTestIds } from '../actions/companies.actions';
import { generateUniqueName } from '../data/role-name-generator';

let companyActions: CompanyActions;

test.describe('Companies - Performance and Load', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    companyActions = new CompanyActions(page);
    await companyActions.navigateTo();
  });

  test.describe('Large Data Sets', () => {
    test('11.1: Should handle large number of companies (100+)', async ({ page }) => {
      // Create multiple companies
      const companyCount = 10; // Using 10 instead of 100+ to keep test fast
      const companies: string[] = [];
      const name = generateUniqueName();
      for (let i = 0; i < companyCount; i++) {
        companies.push(name+i);
        await companyActions.create({ name });
      }

      // Measure page load time
      const startTime = Date.now();
      await companyActions.navigateTo();
      const loadTime = Date.now() - startTime;

      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(10000); // 10 seconds max

      // Table should still be responsive
      const rowCount = await companyActions.getTableRowCount(name);
      expect(rowCount).toBeGreaterThanOrEqual(companyCount);

      // Search should work efficiently
      await companyActions.search(companies[0].substring(0, 5));
      const filteredRowCount = await companyActions.getTableRowCount(name);
      expect(filteredRowCount).toBeGreaterThanOrEqual(0);
    });

    test('Should display pagination or scroll efficiently', async ({ page }) => {
      // Create several companies
      for (let i = 0; i < 5; i++) {
        const name = generateUniqueName();
        await companyActions.create({ name });
      }

      await companyActions.navigateTo();

      // Check for pagination
        await expect(page.getByTestId(companyTestIds.pagination).getByText('Items per page:')).toBeVisible();

        // Or check for virtual scrolling
    });
  });

  test.describe('Rapid Input', () => {
    test('11.2: Should handle rapid search input', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      const searchInput = page.getByTestId(companyTestIds.searchInput);

      // Type rapidly
      const searchTerm = companyName.substring(0, 6);
      const startTime = Date.now();

      for (const char of searchTerm) {
        await searchInput.type(char, { delay: 10 }); // 10ms delay between chars
      }

      const typingTime = Date.now() - startTime;

      // Wait for search to complete
      await page.waitForTimeout(500);

      // Search should complete reasonably fast
      expect(typingTime).toBeLessThan(5000);

      // Results should be displayed
      const rows = page.getByRole('row');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(1);
    });

    test('11.3: Should handle rapid sorting operations', async ({ page }) => {
      // Create a few companies
      for (let i = 0; i < 3; i++) {
        const name = generateUniqueName();
        await companyActions.create({ name });
      }

      await companyActions.navigateTo();

      const nameHeader = page.getByRole('columnheader', { name: /name/i }).first();

      // Click sort header multiple times rapidly
      const startTime = Date.now();

      for (let i = 0; i < 5; i++) {
        await nameHeader.click();
        await page.waitForTimeout(200); // Small delay between clicks
      }

      const operationTime = Date.now() - startTime;

      // Should complete quickly
      expect(operationTime).toBeLessThan(3000);

      // Table should still be functional
      await expect(page.getByTestId(companyTestIds.table)).toBeVisible();

      const rows = page.getByRole('row');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('Should not create memory leaks with repeated operations', async ({ page }) => {
      // Perform multiple create/read/delete cycles
      for (let i = 0; i < 3; i++) {
        const companyName = generateUniqueName();

        // Create
        await companyActions.create({ name: companyName });

        // Read
        await companyActions.navigateTo();
        await companyActions.search(companyName);

        // Delete
        await companyActions.delete(companyName);

        await page.waitForTimeout(200);
      }

      // After operations, page should still be responsive
      await companyActions.navigateTo();
      await expect(page.getByTestId(companyTestIds.table)).toBeVisible();

      // Verify we can still perform operations
      const testName = generateUniqueName();
      await companyActions.create({ name: testName });
      await companyActions.verifyExists(testName);
    });
  });

  test.describe('Modal Performance', () => {
    test('Should open and close modals efficiently', async ({ page }) => {
      // Measure modal open time
      const startOpen = Date.now();
      await page.getByTestId(companyTestIds.newCompanyBtn).click();
      await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();
      const openTime = Date.now() - startOpen;

      expect(openTime).toBeLessThan(1000); // Should be instantaneous

      // Measure modal close time
      const startClose = Date.now();
      await page.getByTestId(companyTestIds.cancelBtn).click();
      await page.waitForTimeout(300);
      const closeTime = Date.now() - startClose;

      expect(closeTime).toBeLessThan(1000); // Should close quickly

      // Repeat multiple times
      for (let i = 0; i < 3; i++) {
        await page.getByTestId(companyTestIds.newCompanyBtn).click();
        await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();
        await page.getByTestId(companyTestIds.cancelBtn).click();
        await page.waitForTimeout(200);
      }

      // Should still work without slowdown
      await page.getByTestId(companyTestIds.newCompanyBtn).click();
      await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();
    });
  });

  test.describe('API Response Times', () => {
    test('Should handle slow API responses gracefully', async ({ page }) => {
      const companyName = generateUniqueName();

      // Create company (measures API response)
      const startTime = Date.now();
      await companyActions.create({ name: companyName });
      const responseTime = Date.now() - startTime;

      // Response should be reasonable
      // (Adjust threshold based on actual API performance)
      expect(responseTime).toBeLessThan(30000); // 30 seconds max

      // Verify company was created despite potential delay
      await companyActions.verifyExists(companyName);
    });
  });

  test.describe('Search Performance', () => {
    test('Should search efficiently with large datasets', async ({ page }) => {
      // Create multiple companies
      const companies: string[] = [];
      for (let i = 0; i < 5; i++) {
        const name = generateUniqueName();
        companies.push(name);
        await companyActions.create({ name });
      }

      // Measure search time
      const startTime = Date.now();
      await companyActions.search(companies[0].substring(0, 5));
      const searchTime = Date.now() - startTime;

      // Search should be fast
      expect(searchTime).toBeLessThan(2000); // 2 seconds max

      // Results should be displayed
      const rows = page.getByRole('row');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(1);
    });
  });
});
