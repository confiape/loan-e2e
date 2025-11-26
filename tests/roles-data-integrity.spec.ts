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

    test.fixme('13.2: Should enforce role name uniqueness', async ({ page }) => {
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

      // Verify role exists before refresh
      await roleActions.verifyExists(roleName);

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify role still exists after refresh
      await roleActions.verifyExists(roleName);
    });

    test('13.6: Should maintain permission consistency', async () => {
      const roleName = generateUniqueName();
      const permission = 'PaymentController_GetDetailed';

      await roleActions.create({
        name: roleName,
        permissions: [permission],
      });

      // Verify permission persists after reload
      await roleActions.verifyPermissionsSelected(roleName, [permission]);
    });

    test('13.7: Should maintain inherited role consistency', async () => {
      const roleName = generateUniqueName();

      await roleActions.create({
        name: roleName,
        inheritedRoles: ['Admin'],
      });

      // Verify inherited role persists
      await roleActions.verifyInheritedRolesSelected(roleName, ['Admin']);
    });
  });

  test.describe('Transaction and Rollback', () => {
    test('13.5: Should handle errors gracefully without partial saves', async ({ page }) => {
      const roleName = generateUniqueName();

      // Start creating a role but cancel before saving
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).fill('Admin');
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdList)
        .getByText('Admin', { exact: true })
        .click();
      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      // Cancel operation
      await page.getByTestId(roleTestIds.cancelBtn).click();

      // Verify role was NOT created
      const tableContent = await page.getByTestId(roleTestIds.table).textContent();
      expect(tableContent).not.toContain(roleName);
    });
  });
});
