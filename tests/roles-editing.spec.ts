import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Editing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test('3.1: Should open Edit modal with prefilled role data', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a test role
    await roleActions.create({
      name: roleName,
    });

    // Navigate back to roles page
    await roleActions.navigateTo();

    // Open edit modal for the created role
    await roleActions.openEditByName(roleName);

    // Verify modal is open
    const modal = page.getByTestId(roleTestIds.modal);
    await expect(modal).toBeVisible();

    // Verify Role Name field is prefilled
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    const inputValue = await nameInput.inputValue();
    expect(inputValue).toBe(roleName);

    // Verify Submit button exists and is enabled
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).not.toBeDisabled();

    // Verify Cancel button exists
    const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
    await expect(cancelBtn).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
  });

  test('3.2: Should edit role name and verify persistence', async ({ page }) => {
    const originalName = generateUniqueName();
    const newName = generateUniqueName();

    // Create a test role
    await roleActions.create({
      name: originalName,
    });

    // Edit the role name
    await roleActions.edit(originalName, {
      name: newName,
    });

    // Verify modal is closed
    const modal = page.getByTestId(roleTestIds.modal);
    await expect(modal).not.toBeVisible();

    // Verify URL is back to /roles
    await expect(page).toHaveURL(/.*\/roles$/);

    // Verify role name is updated in table
    await roleActions.verifyExists(newName);
  });

  test('3.3: Should add inherited role to existing role', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a test role
    await roleActions.create({
      name: roleName,
    });

    // Edit to add inherited role
    await roleActions.edit(roleName, {
      inheritedRoles: ['Admin'],
    });

    // Verify update was successful
    const modal = page.getByTestId(roleTestIds.modal);
    await expect(modal).not.toBeVisible();

    // Verify inherited roles were added
    await roleActions.verifyInheritedRolesSelected(roleName, ['Admin']);
  });

  test('3.4: Should cancel edit operation without saving changes', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a test role
    await roleActions.create({
      name: roleName,
    });

    // Navigate back to roles page
    await roleActions.navigateTo();

    // Open edit modal
    await roleActions.openEditByName(roleName);

    // Modify role name
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    await nameInput.clear();
    await nameInput.fill('Modified Name That Should Not Be Saved');

    // Click Cancel
    const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
    await cancelBtn.click();

    // Verify modal is closed
    const modal = page.getByTestId(roleTestIds.modal);
    await expect(modal).not.toBeVisible();

    // Verify URL is back to /roles
    await expect(page).toHaveURL(/.*\/roles$/);

    // Verify role name is still the original in table
    await roleActions.verifyExists(roleName);
  });
});
