import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Data Integrity and Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test.describe('Data Persistence and Uniqueness', () => {
    test('13.1: Should verify role IDs are unique', async ({ page }) => {
      const idCells = page.getByTestId(roleTestIds.table).locator('td:nth-child(3)');
      const allIds = await idCells.allTextContents();
      const trimmedIds = allIds.map(id => id.trim()).filter(id => id.length > 0);

      const uniqueIds = new Set(trimmedIds);
      expect(uniqueIds.size).toBe(trimmedIds.length);
    });

    test('13.2: Should enforce role name uniqueness', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill('Admin');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForTimeout(1000);

      const modal = page.getByTestId(roleTestIds.modal);
      const stillOpen = await modal.isVisible().catch(() => false);

      const errorMsg = page.locator('[role="alert"], [class*="error"]').first();
      const errorVisible = await errorMsg.isVisible().catch(() => false);

      expect(stillOpen || errorVisible).toBeTruthy();
    });

    test('13.3: Should persist data after browser refresh', async ({ page }) => {
      const roleName = generateUniqueName();

      await roleActions.create({ name: roleName });

      let tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).toContain(roleName);

      await page.reload();
      await page.waitForLoadState('networkidle');

      tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).toContain(roleName);
    });

    test('13.6: Should maintain permission consistency', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.permissionsSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdSearch).fill('Controller');
      await page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByText('Controller', { exact: true })
        .click();
      await page.getByTestId(roleTestIds.permissionsSelect).click();

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForTimeout(1000);

      const row = await page.getByRole('rowheader', { name: roleName, exact: true }).locator('..');
      await row.getByRole('button', { name: 'Edit' }).click();

      await page.getByTestId(roleTestIds.permissionsSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdSearch).fill('Controller');

      const controllerOption = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByText('Controller', { exact: true });
      await expect(controllerOption).toBeChecked();
    });

    test('13.7: Should maintain inherited role consistency', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).fill('Admin');
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdList)
        .getByText('Admin', { exact: true })
        .click();
      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForTimeout(1000);

      const row = await page.getByRole('rowheader', { name: roleName, exact: true }).locator('..');
      await row.getByRole('button', { name: 'Edit' }).click();

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).fill('Admin');

      const adminOption = page.getByTestId(roleTestIds.rolesMultiselectRolesIdList)
        .getByText('Admin', { exact: true });
      await expect(adminOption).toBeChecked();
    });
  });

  test.describe('Transaction and Rollback', () => {
    test('13.5: Should handle errors gracefully without partial saves', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).fill('Admin');
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdList)
        .getByText('Admin', { exact: true })
        .click();
      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      await page.getByTestId(roleTestIds.cancelBtn).click();
      await page.waitForTimeout(500);

      const tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).not.toContain(roleName);
    });
  });
});
