import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { roleTestIds } from '../actions/roles.actions';

test.describe('Role Listing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('19 - View roles list', async ({ page }) => {
    // Verify URL
    expect(page.url()).toContain('/roles');

    // Verify heading
    await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();

    // Verify New Role button
    await expect(page.getByTestId(roleTestIds.newRoleBtn)).toBeVisible();

    // Verify table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verify at least one role exists
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('20 - Verify table structure', async ({ page }) => {
    // Verify table headers
    const headers = page.locator('table thead columnheader');
    
    // Check for specific columns
    await expect(headers).toContainText('Select all');
    await expect(headers).toContainText('Name');
    await expect(headers).toContainText('ID');
    await expect(headers).toContainText('Actions');

    // Verify select all checkbox
    const selectAllCheckbox = page.getByRole('checkbox', { name: 'Select all' });
    await expect(selectAllCheckbox).toBeVisible();

    // Verify sortable Name column (has button)
    const nameHeader = page.locator('table thead button', { hasText: 'Name' });
    await expect(nameHeader).toBeVisible();

    // Verify sortable ID column (has button)
    const idHeader = page.locator('table thead button', { hasText: 'ID' });
    await expect(idHeader).toBeVisible();

    // Verify each row has required elements
    const firstRow = page.locator('table tbody tr').first();
    const checkboxInRow = firstRow.locator('input[type="checkbox"]');
    const editButton = firstRow.getByRole('button', { name: 'Edit' });
    const deleteButton = firstRow.getByRole('button', { name: 'Delete' });

    await expect(checkboxInRow).toBeVisible();
    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
  });

  test('21 - Verify initial data state', async ({ page }) => {
    // Verify at least 3 initial roles exist
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(3);

    // Verify Admin role exists
    const adminRow = page.locator('table tbody tr').filter({ hasText: 'Admin' });
    await expect(adminRow).toBeVisible();

    // Verify Cobrador role exists
    const cobradorRow = page.locator('table tbody tr').filter({ hasText: 'Cobrador' });
    await expect(cobradorRow).toBeVisible();

    // Verify Administrador de Finanzas role exists
    const finanzasRow = page.locator('table tbody tr').filter({ hasText: 'Administrador de Finanzas' });
    await expect(finanzasRow).toBeVisible();

    // Verify role IDs are in correct format (24 hex characters)
    const cells = page.locator('table tbody tr td:nth-child(3)'); // ID column
    const cellCount = await cells.count();
    expect(cellCount).toBeGreaterThan(0);

    const firstIdCell = cells.first();
    const idText = await firstIdCell.textContent();
    // Check if it looks like a MongoDB ObjectId (24 hex characters)
    expect(idText).toMatch(/^[a-f0-9]{24}$/);
  });
});
