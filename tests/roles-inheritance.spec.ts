import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Role Inheritance', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test.describe('Inherited Roles Selection', () => {
    test('11.1: Should display available roles for inheritance', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(generateUniqueName());

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      await expect(page.getByTestId(roleTestIds.rolesMultiselectRolesIdList).getByText('Admin', { exact: true }).first()).toBeVisible();
      const roleOptions = page.getByTestId(roleTestIds.rolesMultiselectRolesIdList).locator('li');
      const count = await roleOptions.count();

      expect(count).toBeGreaterThanOrEqual(2);
      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      await page.getByTestId(roleTestIds.cancelBtn).click();
    });

    test('11.2: Should create role with single inherited role', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).fill('Admin');
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdList)
        .getByText('Admin', { exact: true })
        .first()
        .click();
      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');

      await roleActions.verifyExists(roleName);

      await roleActions.verifyInheritedRolesSelected(roleName, ['Admin']);
      await page.getByTestId(roleTestIds.cancelBtn).click();
    });

    test('11.3: Should create role with multiple inherited roles', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).fill('Admin');
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdList)
        .getByText('Admin', { exact: true })
        .click();

      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).clear();
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).fill('Cobrador');
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdList)
        .getByText('Cobrador', { exact: true })
        .click();

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');

      await roleActions.verifyExists(roleName);
    });

    test('11.4: Should inherit role and add additional permissions', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).fill('Cobrador');
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdList)
        .getByText('Cobrador', { exact: true })
        .click();
      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      await page.getByTestId(roleTestIds.permissionsSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdSearch).fill('Controller');
      await page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .getByText('Controller')
        .first()
        .click();
      await page.getByTestId(roleTestIds.permissionsSelect).click();

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');

      await roleActions.verifyExists(roleName);
    });

    test.fixme('11.6: Should prevent self-inheritance', async ({ page }) => {
      await page.getByTestId(roleTestIds.searchInput).fill('Admin');
      const adminRow = page.getByRole('rowheader', { name: 'Admin', exact: true }).locator('..');
      await adminRow.getByRole('button', { name: 'Edit' }).click();

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).fill('Admin');
      const adminOption = page.getByTestId(roleTestIds.rolesMultiselectRolesIdList)
        .getByText('Admin', { exact: true });

      const count = await adminOption.count();

      if (count > 0) {
        const isDisabled = await adminOption.isDisabled().catch(() => true);
        expect(isDisabled).toBeTruthy();
      }

      await page.getByTestId(roleTestIds.cancelBtn).click();
    });

    test('11.7: Should remove inherited role', async ({ page }) => {
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
      await page.waitForLoadState('networkidle');

      await page.getByTestId(roleTestIds.searchInput).fill(roleName);
      const newRow = page.getByRole('rowheader', { name: roleName, exact: true }).locator('..');
      await newRow.getByRole('button', { name: 'Edit' }).click();

      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdSearch).fill('Admin');
      await page.getByTestId(roleTestIds.rolesMultiselectRolesIdList)
        .getByText('Admin', { exact: true })
        .click();
      await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');

      await roleActions.verifyInheritedRolesNotSelected(roleName, ['Admin']);
      await page.getByTestId(roleTestIds.cancelBtn).click();
    });
  });
});
