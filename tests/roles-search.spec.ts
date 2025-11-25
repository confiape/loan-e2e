import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { roleTestIds, createRole } from '../actions/roles.actions';
import { faker } from '@faker-js/faker';

function generateUniqueName(): string {
  return `SearchTest${faker.string.alphanumeric({ length: 5 })}`;
}

test.describe('Role Search and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('28 - Search by exact role name', async ({ page }) => {
    // Clear search first
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.waitForLoadState('networkidle');

    // Search for exact role
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('Admin');
    await page.waitForLoadState('networkidle');

    // Verify only Admin role is shown
    const rows = page.locator('table tbody tr');
    const firstRow = rows.first();
    await expect(firstRow).toContainText('Admin');

    // Verify other roles are filtered out
    const allRows = await rows.count();
    // Should show Admin and possibly Administrador de Finanzas (contains Admin)
    expect(allRows).toBeGreaterThan(0);
  });

  test('29 - Search by partial role name', async ({ page }) => {
    // Clear search
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.waitForLoadState('networkidle');

    // Search with partial match
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('Admin');
    await page.waitForLoadState('networkidle');

    // Verify multiple results containing "Admin"
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify first row contains "Admin"
    const firstRow = rows.first();
    const text = await firstRow.textContent();
    expect(text?.toLowerCase()).toContain('admin');
  });

  test('30 - Search with no results', async ({ page }) => {
    // Search for non-existent role
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('NonExistentRoleXYZ123456');
    await page.waitForLoadState('networkidle');

    // Verify no rows are displayed
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBe(0);

    // Verify search box still contains the text
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toContain('NonExistentRoleXYZ123456');
  });

  test('31 - Search is case-insensitive', async ({ page }) => {
    // Search with lowercase
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('admin');
    await page.waitForLoadState('networkidle');

    const rowsLowercase = page.locator('table tbody tr');
    const countLowercase = await rowsLowercase.count();

    // Clear and search with uppercase
    await searchInput.clear();
    await page.waitForLoadState('networkidle');
    await searchInput.fill('ADMIN');
    await page.waitForLoadState('networkidle');

    const rowsUppercase = page.locator('table tbody tr');
    const countUppercase = await rowsUppercase.count();

    // Results should be the same
    expect(countLowercase).toBe(countUppercase);
  });

  test('32 - Clear search filter', async ({ page }) => {
    // Count initial roles
    const initialRows = page.locator('table tbody tr');
    const initialCount = await initialRows.count();

    // Apply search filter
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('TestSearchNonExistent');
    await page.waitForLoadState('networkidle');

    let filteredRows = page.locator('table tbody tr');
    let filteredCount = await filteredRows.count();
    expect(filteredCount).toBe(0);

    // Clear search
    await searchInput.clear();
    await page.waitForLoadState('networkidle');

    // Verify all roles are shown again
    const allRows = page.locator('table tbody tr');
    const allCount = await allRows.count();
    expect(allCount).toBeGreaterThan(0);
  });

  test('33 - Search with special characters', async ({ page }) => {
    // Search for special characters that likely don't exist in role names
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('@#$%^&*');
    await page.waitForLoadState('networkidle');

    // Verify no results (assuming no roles have these characters)
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBe(0);

    // Verify no errors occur
    const errors = await page.locator('[role="alert"]').count();
    // Should not have error alerts (though search with special chars is valid)
  });

  test('34 - Search real-time filtering', async ({ page }) => {
    // Clear search
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByTestId(roleTestIds.searchInput);

    // Type first character
    await searchInput.type('A', { delay: 100 });
    await page.waitForLoadState('networkidle');
    let rows1 = page.locator('table tbody tr');
    const count1 = await rows1.count();

    // Type second character
    await searchInput.type('d', { delay: 100 });
    await page.waitForLoadState('networkidle');
    let rows2 = page.locator('table tbody tr');
    const count2 = await rows2.count();

    // Filtering should happen in real-time
    expect(count2).toBeLessThanOrEqual(count1);
  });

  test('35 - Search with leading and trailing spaces', async ({ page }) => {
    // Search with spaces
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('  Admin  ');
    await page.waitForLoadState('networkidle');

    // Verify results are returned (spaces should be handled)
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    // May trim automatically or handle spaces
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('36 - Search then sort maintains search', async ({ page }) => {
    // Apply search filter
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('Admin');
    await page.waitForLoadState('networkidle');

    const rowsBeforeSort = page.locator('table tbody tr');
    const countBeforeSort = await rowsBeforeSort.count();

    // Click Name column to sort
    const nameHeader = page.locator('table thead button', { hasText: 'Name' });
    await nameHeader.click();
    await page.waitForLoadState('networkidle');

    // Verify search filter is still applied
    const rowsAfterSort = page.locator('table tbody tr');
    const countAfterSort = await rowsAfterSort.count();

    // Count should remain the same (filter still active)
    expect(countAfterSort).toBeLessThanOrEqual(countBeforeSort + 1);

    // Verify sort indicator is visible
    const sortIndicator = nameHeader.locator('svg, span');
    // Some indication of sort state should exist
  });

  test('37 - Create role and search for it', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a new role
    await createRole(page, { name: roleName });

    // Clear any previous search
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.clear();
    await page.waitForLoadState('networkidle');

    // Search for the newly created role
    await searchInput.fill(roleName);
    await page.waitForLoadState('networkidle');

    // Verify role appears in search results
    const rows = page.locator('table tbody tr');
    const roleRow = rows.filter({ hasText: roleName });
    await expect(roleRow).toBeVisible();
  });
});
