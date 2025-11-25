import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Creation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test('2.1: Should open New Role modal with correct structure', async ({ page }) => {
    // Click "New Role" button
    await page.getByTestId(roleTestIds.newRoleBtn).click();

    // Verify modal is open
    const modal = page.getByTestId(roleTestIds.modal);
    await expect(modal).toBeVisible();

    // Verify form has Role Name input
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    await expect(nameInput).toBeVisible();

    // Verify Inherited Roles dropdown exists
    const inheritedRolesBtn = page.getByTestId(roleTestIds.inheritedRolesSelect);
    await expect(inheritedRolesBtn).toBeVisible();

    // Verify Permissions dropdown exists
    const permissionsBtn = page.getByTestId(roleTestIds.permissionsSelect);
    await expect(permissionsBtn).toBeVisible();

    // Verify Cancel and Submit buttons
    const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(cancelBtn).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Verify Submit button is initially disabled
    await expect(submitBtn).toBeDisabled();
  });

  test('2.2: Should create role with valid data and multiple selections', async () => {
    const roleName = generateUniqueName();

    await roleActions.create({
      name: roleName,
      inheritedRoles: ['Admin'],
      permissions: ['BorrowerController_GetAllWithActiveLoans'],
    });

    // Verify role appears in table
    await roleActions.verifyExists(roleName);
  });

  test('2.3: Should create role with minimum valid data (only name)', async ({ page }) => {
    const roleName = generateUniqueName();

    await roleActions.create({
      name: roleName,
    });

    // Verify role appears in table
    await roleActions.verifyExists(roleName);

    // Verify modal is closed
    const modal = page.getByTestId(roleTestIds.modal);
    await expect(modal).not.toBeVisible();
  });

  test('2.4: Should keep Submit button disabled when role name is empty', async ({ page }) => {
    // Click "New Role" button
    await page.getByTestId(roleTestIds.newRoleBtn).click();

    // Leave role name empty - don't fill anything
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);

    // Try to click Submit - should be disabled
    await expect(submitBtn).toBeDisabled();

    // Close modal
    const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
    await cancelBtn.click();
  });

  test('2.5: Should validate against special characters in role name', async ({ page }) => {
    // Click "New Role" button
    await page.getByTestId(roleTestIds.newRoleBtn).click();

    // Enter invalid name with special characters
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    await nameInput.fill('Test@Role#123!');

    // Check if Submit button is disabled
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    const isDisabled = await submitBtn.isDisabled();
    expect(isDisabled).toBeTruthy();

    // Close modal
    const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
    await cancelBtn.click();
  });
});
