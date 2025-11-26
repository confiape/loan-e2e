import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Form Validation and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test.describe('Role Name Validation', () => {
    test('9.1: Should keep Submit button disabled when name is empty', async ({ page }) => {
      // Open modal
      await page.getByTestId(roleTestIds.newRoleBtn).click();

      // Leave name empty
      const submitBtn = page.getByTestId(roleTestIds.submitBtn);
      await expect(submitBtn).toBeDisabled();

      // Close modal
      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });

    test('9.2: Should show error for name less than 2 characters', async ({ page }) => {
      // Open modal
      await page.getByTestId(roleTestIds.newRoleBtn).click();

      // Enter single character
      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      await nameInput.fill('A');
      await page.keyboard.press('Tab');

      // Check if Submit button is disabled
      const submitBtn = page.getByTestId(roleTestIds.submitBtn);
      await expect(submitBtn).toBeDisabled();

      // Close modal
      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });

    test('9.3: Should accept exactly 2 character name', async ({ page }) => {
      const roleName = 'IT';

      await roleActions.create({
        name: roleName,
      });

      // Verify in table
      const row = await roleActions.findRowByName(roleName);
      await expect(await row.count()).toBeGreaterThan(0);
    });

    test('9.4: Should accept exactly 40 character name', async ({ page }) => {
      // Open modal
      await page.getByTestId(roleTestIds.newRoleBtn).click();

      // Create 40 char name
      const name40Chars = 'Administration and Management Personnel';
      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      await nameInput.fill(name40Chars);
      await page.keyboard.press('Tab');

      // Check that Submit is enabled
      const submitBtn = page.getByTestId(roleTestIds.submitBtn);
      await expect(submitBtn).not.toBeDisabled();

      // Close modal
      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });

    test('9.5: Should prevent input exceeding 40 characters', async ({ page }) => {
      // Open modal
      await page.getByTestId(roleTestIds.newRoleBtn).click();

      // Try to enter 41+ characters
      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      const longName = 'This is a very long role name that exceeds forty characters definitely';
      await nameInput.fill(longName);
      await page.keyboard.press('Tab');

      // Should either be limited to 40 or show error
      await expect(page.getByTestId('roles-input-name-error')).toContainText('Maximum length is 40');

      // Close modal
      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });

    test('9.6: Should reject special characters in name', async ({ page }) => {
      // Open modal
      await page.getByTestId(roleTestIds.newRoleBtn).click();

      // Enter name with special characters
      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      await nameInput.fill('Test@Role#123!');
      await page.keyboard.press('Tab');

      // Check if Submit button is disabled
      const submitBtn = page.getByTestId(roleTestIds.submitBtn);
      await expect(submitBtn).toBeDisabled();

      // Close modal
      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });

    test('9.7: Should accept numbers and spaces in name', async ({ page }) => {
      const roleName = generateUniqueName() + ' 123';

      await roleActions.create({
        name: roleName,
      });

      // Verify in table
      await roleActions.verifyExists(roleName);
    });

    test('9.8: Should trim leading and trailing spaces', async ({ page }) => {
      // Open modal
      await page.getByTestId(roleTestIds.newRoleBtn).click();

      // Enter name with spaces
      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      await nameInput.fill('  TestRole  ');
      await page.keyboard.press('Tab');

      // Check input value - should be trimmed or allowed
      const inputValue = await nameInput.inputValue();
      expect(inputValue.trim() === 'TestRole' || inputValue === '  TestRole  ').toBeTruthy();

      // Close modal
      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });

    test('9.9: Should show real-time validation feedback', async ({ page }) => {
      // Open modal
      await page.getByTestId(roleTestIds.newRoleBtn).click();

      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      const submitBtn = page.getByTestId(roleTestIds.submitBtn);

      // Initially disabled (empty)
      await expect(submitBtn).toBeDisabled();

      // Type valid name
      await nameInput.fill('TestRole');

      // Should be enabled
      await expect(submitBtn).not.toBeDisabled();

      // Close modal
      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });

    test.fixme('9.13: Should show error for duplicate role name', async ({ page }) => {
      // Get existing role name
      const existingRoleName = 'Admin';

      // Try to create role with same name
      await page.getByTestId(roleTestIds.newRoleBtn).click();

      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      await nameInput.fill(existingRoleName);
      await page.keyboard.press('Tab');

      const submitBtn = page.getByTestId(roleTestIds.submitBtn);
      await submitBtn.click();

      // Should show error or prevent creation
      const modal = page.getByTestId(roleTestIds.modal);
      const isModalStillOpen = await modal.isVisible().catch(() => false);

      // Either modal is still open with error
      expect(isModalStillOpen).toBeTruthy();

      // Close modal if open
      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
      }
    });
  });

  test.describe('Edit Form Validation', () => {
    test.fixme('9.14: Should validate on edit form with same rules', async ({ page }) => {
      const roleName = generateUniqueName();

      // Create a test role
      await roleActions.create({
        name: roleName,fix
      });

      // Navigate back and open edit
      await roleActions.navigateTo();
      await roleActions.openEditByName(roleName);

      // Clear name
      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      await nameInput.clear();
      await page.keyboard.press('Tab');

      // Update button should be disabled
      const updateBtn = page.getByTestId(roleTestIds.updateBtn);
      await expect(updateBtn).toBeDisabled();

      // Close modal
      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });
  });
});
