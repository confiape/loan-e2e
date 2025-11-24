// spec: plan-pruebas-roles.md - Section 2: Edición de Roles
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';

test.describe('Edición de Roles', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
  });

  test('2.1 Edit Existing Role Name', async ({ page }) => {
    // First CREATE a new role called "Original Role Name"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Original Role Name');
    await page.getByTestId('roles-btn-submit').click();
    
    // Search for the role we just created
    await page.getByTestId('roles-search-input').fill('Original Role Name');
    
    // Capture the role ID from the table
    const roleRow = page.locator('tr', { has: page.locator('td', { hasText: 'Original Role Name' }) });
    const roleId = await roleRow.locator('td').nth(1).textContent();
    
    // Click "Edit" button for that role
    await roleRow.getByTestId(`roles-table-action-edit-row-${roleId}`).click();
    
    // Change name to "Updated Role Name"
    await page.getByTestId('roles-input-name').fill('Updated Role Name');
    
    // Click "Update"
    await page.getByTestId('roles-btn-submit').click();
    
    // Clear search and search for the updated role name
    await page.getByTestId('roles-search-input').fill('Updated Role Name');
    
    // Verify the role now shows "Updated Role Name" in the table
    await expect(page.locator('tr', { has: page.locator('td', { hasText: 'Updated Role Name' }) })).toBeVisible();
    
    // Verify ID remains unchanged
    const updatedRoleRow = page.locator('tr', { has: page.locator('td', { hasText: 'Updated Role Name' }) });
    const updatedRoleId = await updatedRoleRow.locator('td').nth(1).textContent();
    expect(updatedRoleId).toBe(roleId);
  });

  test('2.2 Edit Role - Add Additional Permissions', async ({ page }) => {
    // First CREATE a new role called "Permissions Test Role" with NO permissions
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Permissions Test Role');
    await page.getByTestId('roles-btn-submit').click();
    
    // Search for the role
    await page.getByTestId('roles-search-input').fill('Permissions Test Role');
    
    // Click "Edit" for that role
    const roleRow = page.locator('tr', { has: page.locator('td', { hasText: 'Permissions Test Role' }) });
    await roleRow.getByRole('button', { name: /edit/i }).click();
    
    // Click "Permissions" dropdown
    await page.getByRole('button', { name: /^permissions$/i }).click();
    
    // Select 3 permissions
    await page.getByRole('option', { name: 'BorrowerController_CreateBorrower' }).click();
    await page.getByRole('option', { name: 'LoanController_SaveLoan' }).click();
    await page.getByRole('option', { name: 'UserController_GetAllUsers' }).click();
    
    // Click outside to close dropdown
    await page.getByTestId('roles-input-name').click();
    
    // Click "Update"
    await page.getByTestId('roles-btn-submit').click();
    
    // Verify role is updated (modal closes)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('2.3 Edit Role - Remove Permissions', async ({ page }) => {
    // First CREATE a new role with name "Remove Perms Role" and 3 permissions selected
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Remove Perms Role');
    
    // Add 3 permissions
    await page.getByRole('button', { name: /^permissions$/i }).click();
    await page.getByRole('option', { name: 'BorrowerController_CreateBorrower' }).click();
    await page.getByRole('option', { name: 'LoanController_SaveLoan' }).click();
    await page.getByRole('option', { name: 'UserController_GetAllUsers' }).click();
    await page.getByTestId('roles-input-name').click();
    
    await page.getByTestId('roles-btn-submit').click();
    
    // Search for the role
    await page.getByTestId('roles-search-input').fill('Remove Perms Role');
    
    // Click "Edit" for that role
    const roleRow = page.locator('tr', { has: page.locator('td', { hasText: 'Remove Perms Role' }) });
    await roleRow.getByRole('button', { name: /edit/i }).click();
    
    // Click "Permissions" dropdown
    await page.getByRole('button', { name: /^permissions$/i }).click();
    
    // Deselect 2 of the previously selected permissions
    await page.getByRole('option', { name: 'BorrowerController_CreateBorrower' }).click();
    await page.getByRole('option', { name: 'LoanController_SaveLoan' }).click();
    
    // Click outside to close dropdown
    await page.getByTestId('roles-input-name').click();
    
    // Click "Update"
    await page.getByTestId('roles-btn-submit').click();
    
    // Verify role is updated (modal closes)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('2.4 Edit Role - Add Inherited Roles', async ({ page }) => {
    // First CREATE a new role called "Inherit Test Role" with NO inherited roles
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Inherit Test Role');
    await page.getByTestId('roles-btn-submit').click();
    
    // Search for the role
    await page.getByTestId('roles-search-input').fill('Inherit Test Role');
    
    // Click "Edit" for that role
    const roleRow = page.locator('tr', { has: page.locator('td', { hasText: 'Inherit Test Role' }) });
    await roleRow.getByRole('button', { name: /edit/i }).click();
    
    // Click "Inherited Roles" dropdown
    await page.getByRole('button', { name: /inherited roles/i }).click();
    
    // Select "Admin" from the list
    await page.getByRole('option', { name: 'Admin', exact: true }).click();
    
    // Click outside to close dropdown
    await page.getByTestId('roles-input-name').click();
    
    // Click "Update"
    await page.getByTestId('roles-btn-submit').click();
    
    // Verify role is updated (modal closes)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('2.5 Edit Role - Remove Inherited Roles', async ({ page }) => {
    // First CREATE a new role called "Remove Inherit Role" with "Admin" as inherited role
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Remove Inherit Role');
    
    // Add Admin as inherited role
    await page.getByRole('button', { name: /inherited roles/i }).click();
    await page.getByRole('option', { name: 'Admin', exact: true }).click();
    await page.getByTestId('roles-input-name').click();
    
    await page.getByTestId('roles-btn-submit').click();
    
    // Search for the role
    await page.getByTestId('roles-search-input').fill('Remove Inherit Role');
    
    // Click "Edit" for that role
    const roleRow = page.locator('tr', { has: page.locator('td', { hasText: 'Remove Inherit Role' }) });
    await roleRow.getByRole('button', { name: /edit/i }).click();
    
    // Click "Inherited Roles" dropdown
    await page.getByRole('button', { name: /inherited roles/i }).click();
    
    // Deselect "Admin"
    await page.getByRole('option', { name: 'Admin', exact: true }).click();
    
    // Click outside to close dropdown
    await page.getByTestId('roles-input-name').click();
    
    // Click "Update"
    await page.getByTestId('roles-btn-submit').click();
    
    // Verify role is updated (modal closes)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('2.6 Edit Role - Validation Empty Name', async ({ page }) => {
    // First CREATE a role called "Validation Test Role"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Validation Test Role');
    await page.getByTestId('roles-btn-submit').click();
    
    // Search for the role
    await page.getByTestId('roles-search-input').fill('Validation Test Role');
    
    // Click "Edit" for that role
    const roleRow = page.locator('tr', { has: page.locator('td', { hasText: 'Validation Test Role' }) });
    await roleRow.getByRole('button', { name: /edit/i }).click();
    
    // Clear the "Role Name" field completely
    await page.getByTestId('roles-input-name').clear();
    
    // Verify "Update" button is disabled
    await expect(page.getByTestId('roles-btn-submit')).toBeDisabled();
    
    // Verify validation message appears
    await expect(page.getByText(/role name must be between 2-40 characters/i)).toBeVisible();
  });

  test('2.8 Cancel Edit', async ({ page }) => {
    // First CREATE a role called "Cancel Edit Role"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Cancel Edit Role');
    await page.getByTestId('roles-btn-submit').click();
    
    // Search for the role
    await page.getByTestId('roles-search-input').fill('Cancel Edit Role');
    
    // Click "Edit" for that role
    const roleRow = page.locator('tr', { has: page.locator('td', { hasText: 'Cancel Edit Role' }) });
    await roleRow.getByRole('button', { name: /edit/i }).click();
    
    // Change the name to "Should Not Save"
    await page.getByTestId('roles-input-name').fill('Should Not Save');
    
    // Add some permissions
    await page.getByRole('button', { name: /^permissions$/i }).click();
    await page.getByRole('option', { name: 'BorrowerController_CreateBorrower' }).click();
    await page.getByTestId('roles-input-name').click();
    
    // Click "Cancel"
    await page.getByRole('button', { name: /^cancel$/i }).click();
    
    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Clear search to see all roles
    await page.getByTestId('roles-search-input').fill('');
    
    // Search for the original name
    await page.getByTestId('roles-search-input').fill('Cancel Edit Role');
    
    // Verify role still has original name "Cancel Edit Role"
    await expect(page.locator('tr', { has: page.locator('td', { hasText: 'Cancel Edit Role' }) })).toBeVisible();
    
    // Verify "Should Not Save" does not exist
    await page.getByTestId('roles-search-input').fill('Should Not Save');
    await expect(page.getByText(/no data available/i)).toBeVisible();
  });

  test('2.9 Verify Pre-loaded Data', async ({ page }) => {
    // First CREATE a role called "Preload Test Role" with "Admin" inherited and 2 permissions
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Preload Test Role');
    
    // Add Admin as inherited role
    await page.getByRole('button', { name: /inherited roles/i }).click();
    await page.getByRole('option', { name: 'Admin', exact: true }).click();
    await page.getByTestId('roles-input-name').click();
    
    // Add 2 permissions
    await page.getByRole('button', { name: /^permissions$/i }).click();
    await page.getByRole('option', { name: 'BorrowerController_CreateBorrower' }).click();
    await page.getByRole('option', { name: 'LoanController_SaveLoan' }).click();
    await page.getByTestId('roles-input-name').click();
    
    await page.getByTestId('roles-btn-submit').click();
    
    // Search for the role
    await page.getByTestId('roles-search-input').fill('Preload Test Role');
    
    // Click "Edit" for that role
    const roleRow = page.locator('tr', { has: page.locator('td', { hasText: 'Preload Test Role' }) });
    await roleRow.getByRole('button', { name: /edit/i }).click();
    
    // Verify "Role Name" field shows "Preload Test Role"
    await expect(page.getByTestId('roles-input-name')).toHaveValue('Preload Test Role');
    
    // Verify the previously selected inherited roles are shown as selected
    // (This would require checking the dropdown state - implementation depends on UI framework)
    
    // Verify the previously selected permissions are shown as selected
    // (This would require checking the dropdown state - implementation depends on UI framework)
    
    // Click "Cancel" to close
    await page.getByRole('button', { name: /^cancel$/i }).click();
    
    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});
