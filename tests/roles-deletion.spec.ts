// spec: plan-pruebas-roles.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { createRole } from '../actions/roles.actions';

test.describe('Eliminación de Roles', () => {
  test('Delete Individual Role', async ({ page }) => {
    // Login and navigate to roles page
    await login(page);
    await page.goto('/roles');

    // Create a new role called "Role To Delete"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Role To Delete');
    await page.getByTestId('roles-btn-submit').click();

    // Find the role in the table
    await page.getByTestId('roles-search-input').fill('Role To Delete');
    await expect(page.getByRole('rowheader', { name: 'Role To Delete' }).first()).toBeVisible();

    // Click "Delete" button for that role
    const firstDeleteButton = page.locator('tbody tr').first().getByRole('button', { name: 'Delete' });
    await firstDeleteButton.click();

    // Verify confirmation dialog appears
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible();
    await expect(page.getByText(/Are you sure you want to delete.*Role To Delete/)).toBeVisible();

    // Click Confirm/Delete
    await page.getByTestId('roles-btn-confirm-delete').click();

    // Verify the role is removed from the table
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).not.toBeVisible();
    
    // Clear search and verify role count decreased
    await page.getByTestId('roles-search-input').clear();
  });

  test('Delete Individual Role - Cancel Confirmation', async ({ page }) => {
    // Login and navigate to roles page
    await login(page);
    await page.goto('/roles');

    // Create a role called "Dont Delete Me"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Dont Delete Me');
    await page.getByTestId('roles-btn-submit').click();

    // Find and click Delete button for that role
    await page.getByTestId('roles-search-input').fill('Dont Delete Me');
    await expect(page.getByRole('rowheader', { name: 'Dont Delete Me' }).first()).toBeVisible();
    
    const deleteButton = page.locator('tbody tr').first().getByRole('button', { name: 'Delete' });
    await deleteButton.click();

    // Verify confirmation dialog appears
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible();

    // In confirmation dialog, click "Cancel"
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify dialog closes
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).not.toBeVisible();

    // Verify the role is still in the table
    await expect(page.getByRole('rowheader', { name: 'Dont Delete Me' }).first()).toBeVisible();
  });

  test('Delete Multiple Roles - Manual Selection', async ({ page }) => {
    // Login and navigate to roles page
    await login(page);
    await page.goto('/roles');

    // Create 3 roles: "Multi Delete 1", "Multi Delete 2", "Multi Delete 3"
    for (const roleName of ['Multi Delete 1', 'Multi Delete 2', 'Multi Delete 3']) {
      await page.getByTestId('roles-btn-new').click();
      await page.getByTestId('roles-input-name').fill(roleName);
      await page.getByTestId('roles-btn-submit').click();
    }

    // Search for the roles
    await page.getByTestId('roles-search-input').fill('Multi Delete');

    // Select checkboxes for all 3 roles
    await page.locator('tbody tr:nth-child(1) input[type="checkbox"]').check();
    await page.locator('tbody tr:nth-child(2) input[type="checkbox"]').check();
    await page.locator('tbody tr:nth-child(3) input[type="checkbox"]').check();

    // Verify selection bar shows "Selected (3):"
    await expect(page.getByText(/Selected \(3\)/)).toBeVisible();

    // Click "Delete Selected" button
    await page.getByRole('button', { name: /Delete Selected/i }).click();

    // Confirm in dialog
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible();
    await page.getByTestId('roles-btn-confirm-delete').click();

    // Verify all 3 roles are removed from table
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).not.toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Multi Delete 1' })).not.toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Multi Delete 2' })).not.toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Multi Delete 3' })).not.toBeVisible();
  });

  test('Delete Multiple Roles - Select All', async ({ page }) => {
    // Login and navigate to roles page
    await login(page);
    await page.goto('/roles');

    // Click the "Select all" checkbox in table header
    await page.locator('thead input[type="checkbox"]').check();

    // Verify all roles on current page are selected
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const count = await checkboxes.count();
    await expect(checkboxes.first()).toBeChecked();

    // Verify selection bar shows "Selected (10):" or the number of visible roles
    await expect(page.getByText(new RegExp(`Selected \\(${count}\\)`))).toBeVisible();

    // Click "Delete Selected"
    await page.getByRole('button', { name: /Delete Selected/i }).click();

    // Confirm deletion
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible();
    await page.getByTestId('roles-btn-confirm-delete').click();

    // Verify the selected roles are deleted (dialog closes and selection bar disappears)
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).not.toBeVisible();
    await expect(page.getByText(/Selected \(/)).not.toBeVisible();
  });

  test('Delete Roles - Cancel Multiple Deletion', async ({ page }) => {
    // Login and navigate to roles page
    await login(page);
    await page.goto('/roles');

    // Create 2 roles: "Cancel Multi 1", "Cancel Multi 2"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Cancel Multi 1');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Cancel Multi 2');
    await page.getByTestId('roles-btn-submit').click();

    // Search for the roles
    await page.getByTestId('roles-search-input').fill('Cancel Multi');

    // Select both roles via checkboxes
    await page.locator('tbody tr:nth-child(1) input[type="checkbox"]').check();
    await page.locator('tbody tr:nth-child(2) input[type="checkbox"]').check();

    // Verify selection bar appears
    await expect(page.getByText(/Selected \(2\)/)).toBeVisible();

    // Click "Delete Selected"
    await page.getByRole('button', { name: /Delete Selected/i }).click();

    // In confirmation dialog, click "Cancel"
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify dialog closes
    await expect(page.getByRole('heading', { name: 'Confirm Delete' })).not.toBeVisible();

    // Verify both roles remain in table
    await expect(page.getByRole('rowheader', { name: 'Cancel Multi 1' })).toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Cancel Multi 2' })).toBeVisible();

    // Verify they're still selected
    await expect(page.locator('tbody tr:nth-child(1) input[type="checkbox"]')).toBeChecked();
    await expect(page.locator('tbody tr:nth-child(2) input[type="checkbox"]')).toBeChecked();
  });

  test('Clear Selection', async ({ page }) => {
    // Login and navigate to roles page
    await login(page);
    await page.goto('/roles');

    // Create 2 roles: "Select Test 1", "Select Test 2"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Select Test 1');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Select Test 2');
    await page.getByTestId('roles-btn-submit').click();

    // Search for the roles
    await page.getByTestId('roles-search-input').fill('Select Test');

    // Select both roles using checkboxes
    await page.locator('tbody tr:nth-child(1) input[type="checkbox"]').check();
    await page.locator('tbody tr:nth-child(2) input[type="checkbox"]').check();

    // Verify selection bar appears with "Selected (2):"
    await expect(page.getByText(/Selected \(2\)/)).toBeVisible();

    // Click "Clear all" button
    await page.getByRole('button', { name: /Clear all/i }).click();

    // Verify all checkboxes are unchecked
    await expect(page.locator('tbody tr:nth-child(1) input[type="checkbox"]')).not.toBeChecked();
    await expect(page.locator('tbody tr:nth-child(2) input[type="checkbox"]')).not.toBeChecked();

    // Verify selection bar disappears
    await expect(page.getByText(/Selected \(/)).not.toBeVisible();

    // Verify roles are NOT deleted (still visible)
    await expect(page.getByRole('rowheader', { name: 'Select Test 1' })).toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Select Test 2' })).toBeVisible();
  });

  test('Deselect Roles Individually', async ({ page }) => {
    // Login and navigate to roles page
    await login(page);
    await page.goto('/roles');

    // Create 3 roles: "Deselect 1", "Deselect 2", "Deselect 3"
    for (const roleName of ['Deselect 1', 'Deselect 2', 'Deselect 3']) {
      await page.getByTestId('roles-btn-new').click();
      await page.getByTestId('roles-input-name').fill(roleName);
      await page.getByTestId('roles-btn-submit').click();
    }

    // Search for the roles
    await page.getByTestId('roles-search-input').fill('Deselect');

    // Click "Select all" to select all visible roles
    await page.locator('thead input[type="checkbox"]').check();

    // Verify all are selected
    const checkboxCount = await page.locator('tbody input[type="checkbox"]').count();
    await expect(page.getByText(new RegExp(`Selected \\(${checkboxCount}\\)`))).toBeVisible();

    // Click the "Remove from selection" button/X for one of the selected role chips in selection bar
    const firstRemoveButton = page.locator('[role="button"]:has-text("Deselect 1")').locator('button, [role="button"]').last();
    await firstRemoveButton.click();

    // Verify that role is deselected
    const deselectRow = page.locator('tbody tr', { has: page.getByRole('rowheader', { name: 'Deselect 1' }) });
    await expect(deselectRow.locator('input[type="checkbox"]')).not.toBeChecked();

    // Verify other roles remain selected
    const deselect2Row = page.locator('tbody tr', { has: page.getByRole('rowheader', { name: 'Deselect 2' }) });
    await expect(deselect2Row.locator('input[type="checkbox"]')).toBeChecked();

    // Verify counter decreases by 1
    await expect(page.getByText(new RegExp(`Selected \\(${checkboxCount - 1}\\)`))).toBeVisible();
  });

  test('Select and Deselect All Toggle', async ({ page }) => {
    // Login and navigate to roles page
    await login(page);
    await page.goto('/roles');

    // Click "Select all" checkbox
    await page.locator('thead input[type="checkbox"]').check();

    // Verify all roles are selected
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }

    // Verify selection bar appears
    await expect(page.getByText(new RegExp(`Selected \\(${count}\\)`))).toBeVisible();

    // Click "Select all" checkbox again
    await page.locator('thead input[type="checkbox"]').uncheck();

    // Verify all roles are deselected
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }

    // Verify selection bar disappears
    await expect(page.getByText(/Selected \(/)).not.toBeVisible();
  });
});
