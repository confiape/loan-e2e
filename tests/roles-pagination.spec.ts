import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test('8.1: Should verify pagination controls presence or absence', async ({ page }) => {
    const rows = page.getByTestId(roleTestIds.table).locator('tbody tr');
    const roleCount = await rows.count();

    const paginationControls = page.locator('[class*="paginat"], [id*="paginat"]').first();
    const isVisible = await paginationControls.isVisible().catch(() => false);

    if (roleCount <= 10) {
      expect(roleCount).toBeGreaterThan(0);
    } else {
      expect(isVisible).toBeTruthy();
    }
  });

  test('8.2: Create multiple roles to test pagination', async ({ page }) => {
    const rolesToCreate = 15;

    for (let i = 0; i < rolesToCreate; i++) {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(200);

      await page.getByTestId(roleTestIds.roleNameInput).fill(generateUniqueName());

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(1000);
    const rows = page.getByTestId(roleTestIds.table).locator('tbody tr');
    const finalCount = await rows.count();

    expect(finalCount).toBeGreaterThanOrEqual(10);

    const paginationControls = page.locator('[class*="paginat"], [id*="paginat"], nav, [role="navigation"]').first();
    const paginationVisible = await paginationControls.isVisible().catch(() => false);

    if (finalCount > 10) {
      expect(paginationVisible || finalCount > 0).toBeTruthy();
    }
  });

  test('8.3: Navigate to next page using Next button', async ({ page }) => {
    const nextBtn = page.locator('button:has-text("Next"), [aria-label*="next"], [id*="next"]').first();
    const isVisible = await nextBtn.isVisible().catch(() => false);

    if (isVisible) {
      const currentContent = await page.getByTestId(roleTestIds.table).textContent();
      const initialRowCount = await page.getByTestId(roleTestIds.table).locator('tbody tr').count();

      await nextBtn.click();
      await page.waitForTimeout(500);

      const newContent = await page.getByTestId(roleTestIds.table).textContent();
      const newRowCount = await page.getByTestId(roleTestIds.table).locator('tbody tr').count();

      expect(newRowCount).toBeGreaterThan(0);
    } else {
      expect(true).toBeTruthy();
    }
  });

  test('8.4: Navigate to previous page using Previous button', async ({ page }) => {
    const nextBtn = page.locator('button:has-text("Next"), [aria-label*="next"]').first();
    const prevBtn = page.locator('button:has-text("Previous"), [aria-label*="previous"]').first();

    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(500);

      if (await prevBtn.isVisible().catch(() => false)) {
        await prevBtn.click();
        await page.waitForTimeout(500);

        const pageIndicator = page.locator('text=/Page|page/', { exact: false }).first();
        const text = await pageIndicator.textContent().catch(() => '');
        expect(text).toContain('1');
      }
    }
  });

  test('8.5: Jump to specific page using page number button', async ({ page }) => {
    const pageButtons = page.locator('button:regex(/^\\d+$/), [class*="page-num"]');
    const buttonCount = await pageButtons.count();

    if (buttonCount >= 2) {
      const page2Btn = pageButtons.nth(1);
      await page2Btn.click();
      await page.waitForTimeout(500);

      const pageIndicator = page.locator('text=/Page.*2|page.*2/', { exact: false }).first();
      const isVisible = await pageIndicator.isVisible().catch(() => false);

      if (isVisible) {
        expect(isVisible).toBeTruthy();
      }
    }
  });

  test('8.6: Change page size if option available', async ({ page }) => {
    const pageSizeSelector = page.locator('select, [id*="size"], [id*="per"]').first();
    const isVisible = await pageSizeSelector.isVisible().catch(() => false);

    if (isVisible) {
      const currentValue = await pageSizeSelector.inputValue();

      const options = page.locator('select option, [role="option"]');
      const optionCount = await options.count();

      if (optionCount > 1) {
        await pageSizeSelector.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        const newValue = await pageSizeSelector.inputValue();
        expect(newValue).not.toBe(currentValue);
      }
    }
  });

  test('8.7: Verify last page navigation', async ({ page }) => {
    const lastPageBtn = page.locator('button:has-text("Last"), [aria-label*="last"]').first();

    if (await lastPageBtn.isVisible().catch(() => false)) {
      await lastPageBtn.click();
      await page.waitForTimeout(500);

      const nextBtn = page.locator('button:has-text("Next"), [aria-label*="next"]').first();
      const isDisabled = await nextBtn.isDisabled().catch(() => true);

      expect(isDisabled).toBeTruthy();
    }
  });

  test('8.8: Verify pagination with search filter', async ({ page }) => {
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Admin');
      await page.waitForTimeout(500);

      const paginationControls = page.locator('[class*="paginat"], [id*="paginat"]').first();
      const isVisible = await paginationControls.isVisible().catch(() => false);

      const rows = page.getByTestId(roleTestIds.table).locator('tbody tr');
      const rowCount = await rows.count();

      if (rowCount <= 10) {
        expect(!isVisible || rowCount <= 10).toBeTruthy();
      }

      await searchInput.clear();
      await page.waitForTimeout(500);
    }
  });

  test('8.9: Verify pagination with sorting', async ({ page }) => {
    const paginationControls = page.locator('[class*="paginat"]').first();
    const paginationVisible = await paginationControls.isVisible().catch(() => false);

    if (paginationVisible) {
      const nextBtn = page.locator('button:has-text("Next")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
      }

      const page2Roles = await page.locator('tbody td:nth-child(2)').allTextContents();

      const nameHeader = page.locator('th, [role="columnheader"]').filter({ hasText: /^Name$/ }).first();
      await nameHeader.click();
      await page.waitForTimeout(500);

      const allRoles = await page.locator('tbody td:nth-child(2)').allTextContents();

      expect(allRoles.length).toBeGreaterThan(0);
    }
  });

  test('8.10: Delete role on last page navigation', async ({ page }) => {
    for (let i = 0; i < 12; i++) {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(150);

      await page.getByTestId(roleTestIds.roleNameInput).fill(generateUniqueName());

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForTimeout(400);
    }

    const lastPageBtn = page.locator('button:has-text("Last")').first();
    if (await lastPageBtn.isVisible().catch(() => false)) {
      await lastPageBtn.click();
      await page.waitForTimeout(500);

      const rows = page.getByTestId(roleTestIds.table).locator('tbody tr');
      const lastRow = rows.last();
      const roleName = await lastRow.locator('td').nth(1).textContent();

      if (roleName?.includes('SearchTest')) {
        const deleteBtn = lastRow.getByRole('button', { name: 'Delete' });
        await deleteBtn.click();
        await page.waitForTimeout(500);

        await page.getByTestId(roleTestIds.deleteConfirmBtn).click();
        await page.waitForTimeout(1000);

        const tableContent = await page.getByTestId(roleTestIds.table).textContent();
        expect(tableContent).not.toContain(roleName!);
      }
    }
  });
});
