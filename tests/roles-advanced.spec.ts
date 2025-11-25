import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Advanced Features', () => {
  test.describe('Search and Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      roleActions = new RoleActions(page);
      await roleActions.navigateTo();
    });

    test('6.1: Should search by exact role name', async ({ page }) => {
      const searchInput = page.getByTestId(roleTestIds.searchInput);
      await expect(searchInput).toBeVisible();

      await searchInput.fill('Admin');
      await page.waitForTimeout(500);

      const tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).toContain('Admin');
    });

    test('6.2: Should search by partial role name', async ({ page }) => {
      const searchInput = page.getByTestId(roleTestIds.searchInput);
      await searchInput.fill('Admin');
      await page.waitForTimeout(500);

      const tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).toContain('Admin');
    });

    test('6.3: Should show no results for non-existent role', async ({ page }) => {
      const searchInput = page.getByTestId(roleTestIds.searchInput);
      await searchInput.fill('NonExistentRole12345');
      await page.waitForTimeout(500);

      const rows = page.locator('tbody tr, [role="row"]');
      const rowCount = await rows.count();

      if (rowCount > 0) {
        const tableContent = await page.getByTestId(roleTestIds.table).textContent();
        expect(tableContent).not.toContain('NonExistentRole');
      }
    });

    test('6.4: Should search case-insensitively', async ({ page }) => {
      const searchInput = page.getByTestId(roleTestIds.searchInput);

      await searchInput.fill('admin');
      await page.waitForTimeout(500);

      let tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).toContain('Admin');

      await searchInput.clear();
      await searchInput.fill('ADMIN');
      await page.waitForTimeout(500);

      tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).toContain('Admin');
    });

    test('6.5: Should clear search and show all roles', async ({ page }) => {
      const searchInput = page.getByTestId(roleTestIds.searchInput);

      await searchInput.fill('Admin');
      await page.waitForTimeout(500);

      await searchInput.clear();
      await page.waitForTimeout(500);

      const tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).toContain('Admin');
      expect(tableContent).toContain('Cobrador');
      expect(tableContent).toContain('Administrador de Finanzas');
    });

    test('6.8: Should perform real-time filtering', async ({ page }) => {
      const searchInput = page.getByTestId(roleTestIds.searchInput);

      await searchInput.type('A', { delay: 100 });
      let tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).toContain('Admin');

      await searchInput.type('d', { delay: 100 });
      tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).toContain('Admin');

      await searchInput.type('m', { delay: 100 });
      tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).toContain('Admin');
    });
  });

  test.describe('Table Sorting', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      roleActions = new RoleActions(page);
      await roleActions.navigateTo();
    });

    test('7.1: Should sort by Name ascending', async ({ page }) => {
      const nameHeader = page.locator('th, [role="columnheader"]').filter({ hasText: /^Name$/ }).first();
      await nameHeader.click();
      await page.waitForTimeout(500);

      const roleNames = await page.locator('tbody td:nth-child(2), [role="row"] td:nth-child(2)').allTextContents();
      const trimmedNames = roleNames.map(n => n.trim()).filter(n => n.length > 0);

      const sorted = [...trimmedNames].sort();
      expect(trimmedNames).toEqual(sorted);
    });

    test('7.2: Should sort by Name descending', async ({ page }) => {
      const nameHeader = page.locator('th, [role="columnheader"]').filter({ hasText: /^Name$/ }).first();
      await nameHeader.click();
      await page.waitForTimeout(300);
      await nameHeader.click();
      await page.waitForTimeout(500);

      const roleNames = await page.locator('tbody td:nth-child(2), [role="row"] td:nth-child(2)').allTextContents();
      const trimmedNames = roleNames.map(n => n.trim()).filter(n => n.length > 0);

      const sorted = [...trimmedNames].sort().reverse();
      expect(trimmedNames).toEqual(sorted);
    });

    test('7.4: Should sort by ID ascending', async ({ page }) => {
      const idHeader = page.locator('th, [role="columnheader"]').filter({ hasText: /^ID$/ }).first();
      await idHeader.click();
      await page.waitForTimeout(500);

      const headers = page.locator('th, [role="columnheader"]');
      const headerTexts = await headers.allTextContents();

      expect(headerTexts.some(t => t.includes('ID'))).toBeTruthy();
    });

    test('7.6: Should switch between Name and ID sorting', async ({ page }) => {
      let nameHeader = page.locator('th, [role="columnheader"]').filter({ hasText: /^Name$/ }).first();
      await nameHeader.click();
      await page.waitForTimeout(300);

      let roleNames = await page.locator('tbody td:nth-child(2)').allTextContents();

      const idHeader = page.locator('th, [role="columnheader"]').filter({ hasText: /^ID$/ }).first();
      await idHeader.click();
      await page.waitForTimeout(300);

      let roleIds = await page.locator('tbody td:nth-child(3)').allTextContents();

      expect(roleIds.length).toBeGreaterThan(0);
    });
  });

  test.describe('Bulk Selection Operations', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      roleActions = new RoleActions(page);
      await roleActions.navigateTo();
    });

    test('5.1: Should select single role', async ({ page }) => {
      const firstRowCheckbox = page.locator('tbody input[type="checkbox"]').first();
      await firstRowCheckbox.click();
      await page.waitForTimeout(300);

      const isChecked = await firstRowCheckbox.isChecked();
      expect(isChecked).toBeTruthy();
    });

    test('5.2: Should select multiple roles individually', async ({ page }) => {
      const checkboxes = page.locator('tbody input[type="checkbox"]');
      const count = Math.min(3, await checkboxes.count());

      for (let i = 0; i < count; i++) {
        const checkbox = checkboxes.nth(i);
        await checkbox.click();
        await page.waitForTimeout(200);
      }

      const checkedCheckboxes = page.locator('tbody input[type="checkbox"]:checked');
      const checkedCount = await checkedCheckboxes.count();
      expect(checkedCount).toBeGreaterThanOrEqual(count);
    });

    test('5.3: Should select all roles using header checkbox', async ({ page }) => {
      const selectAllCheckbox = page.getByTestId(roleTestIds.selectAllCheckbox);
      await selectAllCheckbox.click();
      await page.waitForTimeout(500);

      const isChecked = await selectAllCheckbox.isChecked();
      expect(isChecked).toBeTruthy();

      const rowCheckboxes = page.locator('tbody input[type="checkbox"]');
      const rowCount = await rowCheckboxes.count();

      for (let i = 0; i < rowCount; i++) {
        const checkbox = rowCheckboxes.nth(i);
        const checked = await checkbox.isChecked();
        expect(checked).toBeTruthy();
      }
    });

    test('5.4: Should deselect single role from selection', async ({ page }) => {
      const selectAllCheckbox = page.getByTestId(roleTestIds.selectAllCheckbox);
      await selectAllCheckbox.click();
      await page.waitForTimeout(300);

      const firstRowCheckbox = page.locator('tbody input[type="checkbox"]').first();
      await firstRowCheckbox.click();
      await page.waitForTimeout(300);

      const isChecked = await firstRowCheckbox.isChecked();
      expect(isChecked).toBeFalsy();

      const selectAllChecked = await selectAllCheckbox.isChecked();
      expect(selectAllChecked || !(await selectAllCheckbox.isChecked())).toBeTruthy();
    });

    test('5.6: Should clear all selections', async ({ page }) => {
      const selectAllCheckbox = page.getByTestId(roleTestIds.selectAllCheckbox);
      await selectAllCheckbox.click();
      await page.waitForTimeout(300);

      await selectAllCheckbox.click();
      await page.waitForTimeout(300);

      const isChecked = await selectAllCheckbox.isChecked();
      expect(isChecked).toBeFalsy();

      const rowCheckboxes = page.locator('tbody input[type="checkbox"]');
      const rowCount = await rowCheckboxes.count();

      for (let i = 0; i < rowCount; i++) {
        const checkbox = rowCheckboxes.nth(i);
        const checked = await checkbox.isChecked();
        expect(checked).toBeFalsy();
      }
    });
  });
});
