import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';

let roleActions: RoleActions;

test.describe('Roles - Listing and Display', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test('1.1: Should display roles list with correct table structure', async ({ page }) => {
    // Verify URL changed to /roles
    await expect(page).toHaveURL(/.*\/roles$/);

    // Verify table exists
    const table = page.getByTestId(roleTestIds.table);
    await expect(table).toBeVisible();

    // Verify "New Role" button is visible
    const newRoleBtn = page.getByTestId(roleTestIds.newRoleBtn);
    await expect(newRoleBtn).toBeVisible();
  });

  test('1.2: Should verify table structure with columns and actions', async ({ page }) => {
    // Verify "Select all" checkbox in header
    const selectAllCheckbox = page.getByTestId(roleTestIds.selectAllCheckbox);
    await expect(selectAllCheckbox).toBeVisible();

    // Verify table rows exist
    const table = page.getByTestId(roleTestIds.table);
    const rows = table.locator('tbody tr, [role="row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify first row has required elements
    const firstRow = rows.first();

    // Check for checkbox in row
    const rowCheckbox = firstRow.locator('input[type="checkbox"]').first();
    await expect(rowCheckbox).toBeVisible();

    // Check for role name
    const roleName = firstRow.locator('td').nth(1);
    await expect(roleName).toBeVisible();

    // Check for role ID
    const roleId = firstRow.locator('td').nth(2);
    await expect(roleId).toBeVisible();

    // Check for action buttons (Edit and Delete)
    const editBtn = firstRow.getByRole('button', { name: 'Edit' });
    const deleteBtn = firstRow.getByRole('button', { name: 'Delete' });
    await expect(editBtn).toBeVisible();
    await expect(deleteBtn).toBeVisible();
  });

  test('1.3: Should verify initial data - at least 3 pre-existing roles', async ({ page }) => {
    // Get all table rows
    const table = page.getByTestId(roleTestIds.table);
    const rows = table.locator('tbody tr, [role="row"]');
    const rowCount = await rows.count();

    // Should have at least 3 roles (Admin, Cobrador, Administrador de Finanzas)
    expect(rowCount).toBeGreaterThanOrEqual(3);

    // Verify role names exist
    const tableContent = await table.textContent();
    expect(tableContent).toContain('Admin');
    expect(tableContent).toContain('Cobrador');
    expect(tableContent).toContain('Administrador de Finanzas');

    // Verify each role has a unique ID in MongoDB ObjectId format
    const roleIds = await rows.locator('td:nth-child(3)').allTextContents();
    const uniqueIds = new Set(roleIds);
    expect(uniqueIds.size).toBe(roleIds.length); // All IDs should be unique

    // Verify IDs are in MongoDB ObjectId format (24 hex characters)
    const mongoIdRegex = /^[a-f0-9]{24}$/i;
    roleIds.forEach(id => {
      const trimmedId = id.trim();
      if (trimmedId.length > 0) {
        expect(mongoIdRegex.test(trimmedId)).toBeTruthy();
      }
    });
  });
});
