import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test('4.1: Should delete single role with confirmation', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a test role to delete
    await roleActions.create({
      name: roleName,
    });

    // Delete the role
    await roleActions.delete(roleName);

    // Verify confirmation modal appears and handle deletion
    const modal = page.getByTestId(roleTestIds.modal);
    await expect(modal).toBeVisible();

    // Click Delete in confirmation
    await page.getByTestId(roleTestIds.deleteConfirmBtn).click();

    // Verify role is no longer in table
    await roleActions.verifyNotExists(roleName);
  });

  test('4.2: Should cancel deletion and keep role in table', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a test role
    await roleActions.create({
      name: roleName,
    });

    // Attempt to delete
    await roleActions.delete(roleName);

    // Verify confirmation modal appears
    const modal = page.getByTestId(roleTestIds.modal);
    await expect(modal).toBeVisible();

    // Click Cancel button
    const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
    await cancelBtn.click();

    // Verify role is still in table
    await roleActions.verifyExists(roleName);
  });

  test('4.3: Should verify role deletion persists after page refresh', async ({ page }) => {
    const roleName = generateUniqueName();

    // Get initial role count
    const initialRows = page.getByTestId(roleTestIds.table).locator('tbody tr, [role="row"]');
    const initialCount = await initialRows.count();

    // Create a test role
    await roleActions.create({
      name: roleName,
    });

    // Verify role exists
    await roleActions.verifyExists(roleName);

    // Delete the role
    await roleActions.delete(roleName);

    // Confirm deletion
    await page.getByTestId(roleTestIds.deleteConfirmBtn).click();

    // Verify role is deleted
    await roleActions.verifyNotExists(roleName);

    // Get row count after deletion
    const rowsAfterDelete = page.getByTestId(roleTestIds.table).locator('tbody tr, [role="row"]');
    const countAfterDelete = await rowsAfterDelete.count();
    expect(countAfterDelete).toBe(initialCount);

    // Refresh the page
    await page.reload();

    // Verify role is still deleted after refresh
    await roleActions.verifyNotExists(roleName);

    // Verify count is still the same
    const finalRows = page.getByTestId(roleTestIds.table).locator('tbody tr, [role="row"]');
    const finalCount = await finalRows.count();
    expect(finalCount).toBe(initialCount);
  });
});
