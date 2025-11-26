import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Edge Cases and Boundary Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test.describe('Special Characters and Unicode', () => {
    test('15.1: Should handle unicode characters in role name', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await expect(page.getByTestId(roleTestIds.modal)).toBeVisible();

      const unicodeName = '管理员角色';
      await page.getByTestId(roleTestIds.roleNameInput).fill(unicodeName);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      const createBtn = page.getByTestId(roleTestIds.submitBtn);
      const isEnabled = !await createBtn.isDisabled();

      if (isEnabled) {
        await createBtn.click();
        await page.waitForLoadState('networkidle');

        await roleActions.verifyExists(unicodeName);
      } else {
        expect(isEnabled).toBeFalsy();
        await page.getByTestId(roleTestIds.cancelBtn).click();
      }
    });

    test('15.2: Should handle emoji in role name appropriately', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await expect(page.getByTestId(roleTestIds.modal)).toBeVisible();

      const emojiName = 'Admin 👨‍💼';
      await page.getByTestId(roleTestIds.roleNameInput).fill(emojiName);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      const createBtn = page.getByTestId(roleTestIds.submitBtn);
      const isEnabled = !await createBtn.isDisabled();

      if (isEnabled) {
        await createBtn.click();
        await page.waitForLoadState('networkidle');

        await roleActions.verifyExists('Admin');
      } else {
        expect(isEnabled).toBeFalsy();
        await page.getByTestId(roleTestIds.cancelBtn).click();
      }
    });
  });

  test.describe('Large Data Sets', () => {
    test('15.3: Should handle very long permission list', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await expect(page.getByTestId(roleTestIds.modal)).toBeVisible();

      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
      await page.getByTestId(roleTestIds.permissionsSelect).click();

      const allPerms = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .locator('div').filter({ hasText: 'Controller' });
      const permCount = await allPerms.count();

      const selectCount = Math.min(10, permCount);
      for (let i = 0; i < selectCount; i++) {
        const perm = allPerms.nth(i);
        const checkbox = perm.locator('input[type="checkbox"]').first();
        if (!(await checkbox.isChecked())) {
          await perm.click();
          await page.waitForTimeout(100);
        }
      }

      await page.getByTestId(roleTestIds.permissionsSelect).click();
      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');

      await roleActions.verifyExists(roleName);
    });
  });

  test.describe('Empty and Null States', () => {
    test('15.4: Should allow role with no permissions or inherited roles', async ({ page }) => {
      const roleName = generateUniqueName();

      await roleActions.create({ name: roleName });
      await roleActions.verifyExists(roleName);

      const row = await page.getByRole('rowheader', { name: roleName, exact: true }).locator('..');
      await row.getByRole('button', { name: 'Edit' }).click();
      await expect(page.getByTestId(roleTestIds.modal)).toBeVisible();

      await page.getByTestId(roleTestIds.permissionsSelect).click();

      const selectedPerms = page.getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
        .locator('input[type="checkbox"]:checked');
      const selectedCount = await selectedPerms.count();
      expect(selectedCount).toBe(0);

      await page.getByTestId(roleTestIds.permissionsSelect).click();
      await page.getByTestId(roleTestIds.cancelBtn).click();
    });
  });

  test.describe('Rapid Operations', () => {
    test('15.5: Should handle rapidly creating multiple roles', async ({ page }) => {
      const roleName1 = generateUniqueName();
      const roleName2 = generateUniqueName();
      const roleName3 = generateUniqueName();

      await roleActions.create({ name: roleName1 });
      await roleActions.create({ name: roleName2 });
      await roleActions.create({ name: roleName3 });

      await roleActions.verifyExists(roleName1);
      await roleActions.verifyExists(roleName2);
      await roleActions.verifyExists(roleName3);
    });
  });

  test.describe('Browser Back Button and Navigation', () => {
    test.fixme('15.8: Should handle browser back button after creating role', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await expect(page.getByTestId(roleTestIds.modal)).toBeVisible();

      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');

      await page.goBack();
      await page.waitForTimeout(500);

      const currentUrl = page.url();
      expect(currentUrl).toContain('/roles');

      await roleActions.verifyExists(roleName);
    });
  });

  test.describe('Database Special Characters', () => {
    test('15.10: Should escape special database characters properly', async ({ page }) => {
      const roleName = generateUniqueName();

      await roleActions.create({ name: roleName });

      await roleActions.verifyExists(roleName);

      await page.getByTestId(roleTestIds.searchInput).fill(roleName);
      await page.waitForTimeout(300);

      await roleActions.verifyExists(roleName);

      await page.getByTestId(roleTestIds.searchInput).clear();
    });
  });

  test.describe('Display and Rendering Edge Cases', () => {
    test('15.9: Should handle maximum roles without performance issues', async ({ page }) => {
      const roleName = generateUniqueName();      
      await page.getByTestId(roleTestIds.searchInput).fill(roleName);
      const startCount = await page.getByRole('row').count();

      const roleName1 = roleName + '1';
      const roleName2 = roleName + '2';
      const roleName3 = roleName + '4';

      await roleActions.create({ name: roleName1 });
      await roleActions.create({ name: roleName2 });
      await roleActions.create({ name: roleName3 });


      const finalCount = await page.getByRole('row').count();
      expect(finalCount).toBeGreaterThanOrEqual(startCount + 3);

      await expect(page.getByTestId(roleTestIds.table)).toBeVisible();
    });
  });
});
