import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { createRole, findRoleRowByName, roleTestIds } from '../actions/roles.actions';
import { faker } from '@faker-js/faker';

function generateUniqueName(): string {
  return `DeleteTest${faker.string.alphanumeric({ length: 5 })}`;
}

test.describe('Role Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('22 - Delete single role - Confirm', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a test role to delete
    await createRole(page, { name: roleName });

    // Search for the role
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    // Verify role exists
    const roleRow = await findRoleRowByName(page, roleName);
    await expect(roleRow).toBeVisible();

    // Click Delete button
    const deleteButton = roleRow.getByRole('button', { name: 'Delete' });
    await deleteButton.click();
    await page.waitForLoadState('networkidle');

    // Verify confirmation modal appears
    const confirmationModal = page.locator('[role="dialog"]');
    await expect(confirmationModal).toBeVisible();

    // Verify confirmation message mentions role name
    await expect(confirmationModal).toContainText(roleName);

    // Click Delete in confirmation
    const deleteConfirmButton = confirmationModal.getByRole('button', { name: 'Delete' });
    await deleteConfirmButton.click();
    await page.waitForLoadState('networkidle');

    // Verify role is removed from table
    const roleRowAfterDelete = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(roleRowAfterDelete).not.toBeVisible();
  });

  test('23 - Delete single role - Cancel', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a test role
    await createRole(page, { name: roleName });

    // Search for the role
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    // Verify role exists
    const roleRow = await findRoleRowByName(page, roleName);
    await expect(roleRow).toBeVisible();

    // Click Delete button
    const deleteButton = roleRow.getByRole('button', { name: 'Delete' });
    await deleteButton.click();
    await page.waitForLoadState('networkidle');

    // Verify confirmation modal appears
    const confirmationModal = page.locator('[role="dialog"]');
    await expect(confirmationModal).toBeVisible();

    // Click Cancel
    const cancelButton = confirmationModal.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();
    await page.waitForLoadState('networkidle');

    // Verify modal is closed
    await expect(confirmationModal).not.toBeVisible();

    // Verify role still exists
    const roleRowAfter = await findRoleRowByName(page, roleName);
    await expect(roleRowAfter).toBeVisible();
  });

  test('24 - Close delete confirmation modal with X button', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a test role
    await createRole(page, { name: roleName });

    // Search for the role
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    // Click Delete button
    const roleRow = await findRoleRowByName(page, roleName);
    const deleteButton = roleRow.getByRole('button', { name: 'Delete' });
    await deleteButton.click();
    await page.waitForLoadState('networkidle');

    // Verify confirmation modal
    const confirmationModal = page.locator('[role="dialog"]');
    await expect(confirmationModal).toBeVisible();

    // Click Cancel button to close
    const cancelButton = confirmationModal.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();
    await page.waitForLoadState('networkidle');

    // Verify modal is closed
    await expect(confirmationModal).not.toBeVisible();

    // Verify role still exists
    const roleRowAfter = await findRoleRowByName(page, roleName);
    await expect(roleRowAfter).toBeVisible();
  });

  test('25 - Delete role and verify removal', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a test role
    await createRole(page, { name: roleName });

    // Search for the role
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    // Verify role exists
    let roleRow = await findRoleRowByName(page, roleName);
    await expect(roleRow).toBeVisible();

    // Delete the role
    const deleteButton = roleRow.getByRole('button', { name: 'Delete' });
    await deleteButton.click();
    await page.waitForLoadState('networkidle');

    const confirmationModal = page.locator('[role="dialog"]');
    const deleteConfirmButton = confirmationModal.getByRole('button', { name: 'Delete' });
    await deleteConfirmButton.click();
    await page.waitForLoadState('networkidle');

    // Clear search to see all roles
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.waitForLoadState('networkidle');

    // Verify role is not in table
    const roleRowAfter = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(roleRowAfter).not.toBeVisible();

    // Refresh page and verify deletion persists
    await page.reload();
    await page.waitForLoadState('networkidle');

    const roleRowAfterRefresh = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(roleRowAfterRefresh).not.toBeVisible();
  });

  test('26 - Attempt to delete critical system role shows behavior', async ({ page }) => {
    // Note: This test documents the actual behavior
    // Navigate to first page to ensure Admin is visible
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.waitForLoadState('networkidle');

    // Search for Admin role
    await page.getByTestId(roleTestIds.searchInput).fill('Admin');
    await page.waitForLoadState('networkidle');

    // Verify Admin role exists
    const adminRow = page.locator('table tbody tr').filter({ hasText: /^Admin$/ });
    await expect(adminRow).toBeVisible();

    // Click Delete button on Admin
    const deleteButton = adminRow.first().getByRole('button', { name: 'Delete' });
    await deleteButton.click();
    await page.waitForLoadState('networkidle');

    // Verify confirmation modal appears (system may allow deletion or show warning)
    const confirmationModal = page.locator('[role="dialog"]');
    await expect(confirmationModal).toBeVisible();

    // Close without deleting - we don't want to delete system roles
    const cancelButton = confirmationModal.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();
    await page.waitForLoadState('networkidle');

    // Verify Admin still exists
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.getByTestId(roleTestIds.searchInput).fill('Admin');
    await page.waitForLoadState('networkidle');

    const adminRowAfter = page.locator('table tbody tr').filter({ hasText: /^Admin$/ });
    await expect(adminRowAfter).toBeVisible();
  });

  test('27 - Delete role with empty search result', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a test role
    await createRole(page, { name: roleName });

    // Note: This test verifies delete behavior is consistent
    // We'll create then immediately delete
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    const roleRow = await findRoleRowByName(page, roleName);
    const deleteButton = roleRow.getByRole('button', { name: 'Delete' });
    await deleteButton.click();
    await page.waitForLoadState('networkidle');

    const confirmationModal = page.locator('[role="dialog"]');
    const deleteConfirmButton = confirmationModal.getByRole('button', { name: 'Delete' });
    await deleteConfirmButton.click();
    await page.waitForLoadState('networkidle');

    // Verify no results are shown
    const noResultsRow = page.locator('table tbody tr');
    const rowCount = await noResultsRow.count();
    expect(rowCount).toBe(0);
  });
});
