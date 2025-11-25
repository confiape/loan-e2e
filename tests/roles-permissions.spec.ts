import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Permission Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test.describe('View and Select Permissions', () => {
    test('10.1: Should display all available permissions in dropdown', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(generateUniqueName());

      await page.getByTestId(roleTestIds.permissionsSelect).click();

      const permissionOptions = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByRole('checkbox');
      const count = await permissionOptions.count();

      expect(count).toBeGreaterThanOrEqual(10);

      await page.keyboard.press('Escape');
      await page.getByTestId(roleTestIds.cancelBtn).click();
    });

    test('10.2: Should select single permission', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.permissionsSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByRole('checkbox').first().click();
      await page.getByTestId(roleTestIds.permissionsSelect).click();

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');

      await roleActions.verifyExists(roleName);
    });

    test('10.3: Should select multiple permissions', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.permissionsSelect).click();

      const checkboxes = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByRole('checkbox');
      const count = Math.min(3, await checkboxes.count());

      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).click();
      }

      await page.getByTestId(roleTestIds.permissionsSelect).click();
      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');

      await roleActions.verifyExists(roleName);
    });

    test('10.4: Should search permissions by controller name', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(generateUniqueName());

      await page.getByTestId(roleTestIds.permissionsSelect).click();

      const searchInput = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdSearch);
      await searchInput.fill('Loan');

      const options = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByText('Loan');
      const count = await options.count();

      expect(count).toBeGreaterThan(0);

      await page.keyboard.press('Escape');
      await page.getByTestId(roleTestIds.cancelBtn).click();
    });

    test('10.5: Should search permissions by action name', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(generateUniqueName());

      await page.getByTestId(roleTestIds.permissionsSelect).click();

      const searchInput = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdSearch);
      await searchInput.fill('Delete');

      const options = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByText('Delete');
      const count = await options.count();

      expect(count).toBeGreaterThan(0);

      await page.keyboard.press('Escape');
      await page.getByTestId(roleTestIds.cancelBtn).click();
    });

    test('10.8: Should persist permissions after save', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.permissionsSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByRole('checkbox').first().click();
      await page.getByTestId(roleTestIds.permissionsSelect).click();

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');

      const row = page.getByRole('rowheader', { name: roleName, exact: true }).locator('..');
      await row.getByRole('button', { name: 'Edit' }).click();

      await page.getByTestId(roleTestIds.permissionsSelect).click();

      const selectedCheckboxes = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByRole('checkbox', { checked: true });
      const selectedCount = await selectedCheckboxes.count();

      expect(selectedCount).toBeGreaterThan(0);

      await page.keyboard.press('Escape');
      await page.getByTestId(roleTestIds.cancelBtn).click();
    });

    test('10.9: Should show admin role has many permissions', async ({ page }) => {
      const adminRow = page.getByRole('rowheader', { name: 'Admin', exact: true }).locator('..');
      await adminRow.getByRole('button', { name: 'Edit' }).click();

      await page.getByTestId(roleTestIds.permissionsSelect).click();

      const selectedCheckboxes = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByRole('checkbox', { checked: true });
      const selectedCount = await selectedCheckboxes.count();

      expect(selectedCount).toBeGreaterThanOrEqual(10);

      await page.keyboard.press('Escape');
      await page.getByTestId(roleTestIds.cancelBtn).click();
    });
  });
});
