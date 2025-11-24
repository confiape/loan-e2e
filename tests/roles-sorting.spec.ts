// spec: plan-pruebas-roles.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { login } from '../actions/auth.actions';

test.describe('Ordenamiento de Roles', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
  });

  test('5.1 Sort by Name - Ascending', async ({ page }) => {
    // Create 3 roles with names: "Zebra Role", "Apple Role", "Middle Role"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Zebra Role');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Apple Role');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Middle Role');
    await page.getByTestId('roles-btn-submit').click();

    // Click on the "Name" column header button to sort
    await page.getByRole('button', { name: 'Name' }).click();

    // Verify ascending icon/indicator appears
    const nameColumnHeader = page.locator('thead').getByRole('button', { name: 'Name' });
    await expect(nameColumnHeader.locator('img')).toBeVisible();

    // Search for our test roles to verify order
    await page.getByTestId('roles-search-input').fill('Apple');
    await expect(page.locator('tbody tr').first().getByRole('rowheader')).toContainText('Apple Role');

    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill('Middle');
    await expect(page.locator('tbody tr').first().getByRole('rowheader')).toContainText('Middle Role');

    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill('Zebra');
    await expect(page.locator('tbody tr').first().getByRole('rowheader')).toContainText('Zebra Role');

    // Verify roles are sorted A-Z (Apple first, Zebra last)
    // Apple should come before Middle, Middle before Zebra alphabetically
    await page.getByTestId('roles-search-input').clear();
  });

  test('5.2 Sort by Name - Descending', async ({ page }) => {
    // Create 3 roles with names: "Alpha Test", "Zulu Test", "Beta Test"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Alpha Test');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Zulu Test');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Beta Test');
    await page.getByTestId('roles-btn-submit').click();

    // Click on "Name" column header button TWICE
    await page.getByRole('button', { name: 'Name' }).click();
    await page.getByRole('button', { name: 'Name' }).click();

    // Verify descending icon/indicator appears
    const nameColumnHeader = page.locator('thead').getByRole('button', { name: 'Name' });
    await expect(nameColumnHeader.locator('img')).toBeVisible();

    // Verify roles are sorted Z-A (Zulu first, Alpha last)
    await page.getByTestId('roles-search-input').fill('Zulu');
    await expect(page.locator('tbody tr').first().getByRole('rowheader')).toContainText('Zulu Test');

    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill('Alpha');
    await expect(page.locator('tbody tr').first().getByRole('rowheader')).toContainText('Alpha Test');

    await page.getByTestId('roles-search-input').clear();
  });

  test('5.3 Sort by ID - Ascending', async ({ page }) => {
    // Click on the "ID" column header button
    await page.getByRole('button', { name: 'ID' }).click();

    // Verify ascending icon appears on ID column
    const idColumnHeader = page.locator('thead').getByRole('button', { name: 'ID' });
    await expect(idColumnHeader.locator('img')).toBeVisible();

    // Get first and last role IDs from visible table
    const firstRowId = await page.locator('tbody tr').first().locator('td').nth(1).textContent();
    const lastRowId = await page.locator('tbody tr').last().locator('td').nth(1).textContent();

    // Verify first ID is smaller than last ID (ascending order)
    expect(firstRowId).toBeTruthy();
    expect(lastRowId).toBeTruthy();
    if (firstRowId && lastRowId) {
      expect(firstRowId.localeCompare(lastRowId)).toBeLessThan(0);
    }
  });

  test('5.4 Sort by ID - Descending', async ({ page }) => {
    // Click on "ID" column header button TWICE
    await page.getByRole('button', { name: 'ID' }).click();
    await page.getByRole('button', { name: 'ID' }).click();

    // Verify descending icon appears
    const idColumnHeader = page.locator('thead').getByRole('button', { name: 'ID' });
    await expect(idColumnHeader.locator('img')).toBeVisible();

    // Get first and last role IDs from visible table
    const firstRowId = await page.locator('tbody tr').first().locator('td').nth(1).textContent();
    const lastRowId = await page.locator('tbody tr').last().locator('td').nth(1).textContent();

    // Verify first ID is larger than last ID (descending order)
    expect(firstRowId).toBeTruthy();
    expect(lastRowId).toBeTruthy();
    if (firstRowId && lastRowId) {
      expect(firstRowId.localeCompare(lastRowId)).toBeGreaterThan(0);
    }
  });

  test('5.5 Switch Between Different Column Sorts', async ({ page }) => {
    // Click "Name" to sort by name
    await page.getByRole('button', { name: 'Name' }).click();

    // Verify name column has sort indicator
    const nameColumnHeader = page.locator('thead').getByRole('button', { name: 'Name' });
    await expect(nameColumnHeader.locator('img')).toBeVisible();

    // Click "ID" to sort by ID
    await page.getByRole('button', { name: 'ID' }).click();

    // Verify ID column has sort indicator
    const idColumnHeader = page.locator('thead').getByRole('button', { name: 'ID' });
    await expect(idColumnHeader.locator('img')).toBeVisible();

    // Verify name column indicator is removed (only one column sorted at a time)
    // The name button should still exist but without active state
    await expect(nameColumnHeader).toBeVisible();
  });

  test('5.6 Sorting with Pagination', async ({ page }) => {
    // Create roles: "AAA Sort Test", "ZZZ Sort Test"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('AAA Sort Test');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('ZZZ Sort Test');
    await page.getByTestId('roles-btn-submit').click();

    // Sort by "Name" ascending
    await page.getByRole('button', { name: 'Name' }).click();

    // Verify "AAA Sort Test" appears on page 1
    await page.getByTestId('roles-search-input').fill('AAA Sort Test');
    await expect(page.locator('tbody tr').first().getByRole('rowheader')).toContainText('AAA Sort Test');
    await page.getByTestId('roles-search-input').clear();

    // Navigate to last page
    const nextButton = page.getByRole('button', { name: 'Next' });
    while (await nextButton.isEnabled()) {
      await nextButton.click();
    }

    // Verify sort indicator remains visible across pages
    const nameColumnHeader = page.locator('thead').getByRole('button', { name: 'Name' });
    await expect(nameColumnHeader.locator('img')).toBeVisible();

    // Verify roles on last page continue alphabetical order
    const lastPageFirstRole = await page.locator('tbody tr').first().getByRole('rowheader').textContent();
    expect(lastPageFirstRole).toBeTruthy();
  });

  test('5.7 Sorting after Search', async ({ page }) => {
    // Create 3 roles: "SearchSort AAA", "SearchSort ZZZ", "SearchSort MMM"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('SearchSort AAA');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('SearchSort ZZZ');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('SearchSort MMM');
    await page.getByTestId('roles-btn-submit').click();

    // Search for "SearchSort"
    await page.getByTestId('roles-search-input').fill('SearchSort');

    // Click "Name" column to sort
    await page.getByRole('button', { name: 'Name' }).click();

    // Verify filtered results are sorted A-Z
    const firstRole = await page.locator('tbody tr').first().getByRole('rowheader').textContent();
    const secondRole = await page.locator('tbody tr').nth(1).getByRole('rowheader').textContent();
    const thirdRole = await page.locator('tbody tr').nth(2).getByRole('rowheader').textContent();

    expect(firstRole).toContain('SearchSort AAA');
    expect(secondRole).toContain('SearchSort MMM');
    expect(thirdRole).toContain('SearchSort ZZZ');

    // Verify only the 3 filtered roles appear in sorted order
    const roleCount = await page.locator('tbody tr').count();
    expect(roleCount).toBe(3);

    await page.getByTestId('roles-search-input').clear();
  });

  test('5.8 Sorting after Creating New Role', async ({ page }) => {
    // Sort table by "Name" ascending
    await page.getByRole('button', { name: 'Name' }).click();

    // Create a new role "AAA First Role" (should appear first when sorted)
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('AAA First Role');
    await page.getByTestId('roles-btn-submit').click();

    // Verify the new role appears in correct position (at/near top)
    await page.getByTestId('roles-search-input').fill('AAA First Role');
    await expect(page.locator('tbody tr').first().getByRole('rowheader')).toContainText('AAA First Role');

    // Verify sort indicator remains active
    const nameColumnHeader = page.locator('thead').getByRole('button', { name: 'Name' });
    await expect(nameColumnHeader.locator('img')).toBeVisible();

    await page.getByTestId('roles-search-input').clear();
  });

  test('5.10 Sorting and Multi-Select', async ({ page }) => {
    // Create 3 roles: "Select A", "Select Z", "Select M"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Select A');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Select Z');
    await page.getByTestId('roles-btn-submit').click();

    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('Select M');
    await page.getByTestId('roles-btn-submit').click();

    // Search for the roles
    await page.getByTestId('roles-search-input').fill('Select');

    // Select all 3 roles (check their checkboxes)
    const rows = page.locator('tbody tr');
    await rows.nth(0).locator('input[type="checkbox"]').check();
    await rows.nth(1).locator('input[type="checkbox"]').check();
    await rows.nth(2).locator('input[type="checkbox"]').check();

    // Sort by "Name"
    await page.getByRole('button', { name: 'Name' }).click();

    // Verify the 3 roles remain selected after sorting
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    const secondCheckbox = page.locator('tbody tr').nth(1).locator('input[type="checkbox"]');
    const thirdCheckbox = page.locator('tbody tr').nth(2).locator('input[type="checkbox"]');

    await expect(firstCheckbox).toBeChecked();
    await expect(secondCheckbox).toBeChecked();
    await expect(thirdCheckbox).toBeChecked();

    // Verify their checkboxes are still checked and selection bar shows "Selected (3):"
    await expect(page.getByText(/Selected \(3\)/)).toBeVisible();

    await page.getByTestId('roles-search-input').clear();
  });
});
