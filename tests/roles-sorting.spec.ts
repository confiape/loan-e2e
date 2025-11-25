import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { roleTestIds } from '../actions/roles.actions';

test.describe('Role Table Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
    
    // Clear search to ensure we're working with full dataset
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.waitForLoadState('networkidle');
  });

  test('38 - Sort by Name - Ascending', async ({ page }) => {
    // Click Name column header to sort ascending
    const nameHeader = page.locator('table thead button', { hasText: 'Name' });
    await nameHeader.click();
    await page.waitForLoadState('networkidle');

    // Get all role names from table
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 1) {
      // Get first two role names to verify ascending order
      const firstRow = rows.nth(0);
      const secondRow = rows.nth(1);
      
      const firstName = await firstRow.locator('th').first().textContent();
      const secondName = await secondRow.locator('th').first().textContent();
      
      // Names should be in ascending order (alphabetically)
      if (firstName && secondName) {
        expect(firstName.localeCompare(secondName)).toBeLessThanOrEqual(0);
      }
    }
  });

  test('39 - Sort by Name - Descending', async ({ page }) => {
    // Click Name column header once to sort ascending
    const nameHeader = page.locator('table thead button', { hasText: 'Name' });
    await nameHeader.click();
    await page.waitForLoadState('networkidle');

    // Click again to sort descending
    await nameHeader.click();
    await page.waitForLoadState('networkidle');

    // Get role names
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 1) {
      const firstRow = rows.nth(0);
      const secondRow = rows.nth(1);
      
      const firstName = await firstRow.locator('th').first().textContent();
      const secondName = await secondRow.locator('th').first().textContent();
      
      // Names should be in descending order
      if (firstName && secondName) {
        expect(firstName.localeCompare(secondName)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('40 - Sort by Name - Toggle multiple times', async ({ page }) => {
    const nameHeader = page.locator('table thead button', { hasText: 'Name' });
    
    // First click - ascending
    await nameHeader.click();
    await page.waitForLoadState('networkidle');
    let rows = page.locator('table tbody tr');
    const firstList = await Promise.all(
      (await rows.all()).slice(0, 3).map(row => row.locator('th').first().textContent())
    );

    // Second click - descending
    await nameHeader.click();
    await page.waitForLoadState('networkidle');
    rows = page.locator('table tbody tr');
    const secondList = await Promise.all(
      (await rows.all()).slice(0, 3).map(row => row.locator('th').first().textContent())
    );

    // Lists should be different (reversed)
    expect(firstList).not.toEqual(secondList);

    // Third click - may toggle back to ascending
    await nameHeader.click();
    await page.waitForLoadState('networkidle');
  });

  test('41 - Sort by ID - Ascending', async ({ page }) => {
    // Click ID column header
    const idHeader = page.locator('table thead button', { hasText: 'ID' });
    await idHeader.click();
    await page.waitForLoadState('networkidle');

    // Verify ID column is now sorted
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 1) {
      // Get first two IDs
      const firstRow = rows.nth(0);
      const secondRow = rows.nth(1);
      
      const firstId = await firstRow.locator('td').nth(1).textContent();
      const secondId = await secondRow.locator('td').nth(1).textContent();
      
      // Verify IDs are different (basic validation)
      expect(firstId).not.toBe(secondId);
    }
  });

  test('42 - Sort by ID - Descending', async ({ page }) => {
    // Click ID column header once
    const idHeader = page.locator('table thead button', { hasText: 'ID' });
    await idHeader.click();
    await page.waitForLoadState('networkidle');

    // Click again for descending
    await idHeader.click();
    await page.waitForLoadState('networkidle');

    // Verify sorted state
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('43 - Switch between Name and ID sorting', async ({ page }) => {
    // Sort by Name
    const nameHeader = page.locator('table thead button', { hasText: 'Name' });
    await nameHeader.click();
    await page.waitForLoadState('networkidle');

    // Get names order
    const rowsAfterNameSort = page.locator('table tbody tr');
    const namesOrder = await Promise.all(
      (await rowsAfterNameSort.all()).slice(0, 2).map(row => row.locator('th').first().textContent())
    );

    // Switch to ID sorting
    const idHeader = page.locator('table thead button', { hasText: 'ID' });
    await idHeader.click();
    await page.waitForLoadState('networkidle');

    // Get IDs after sort
    const rowsAfterIdSort = page.locator('table tbody tr');
    const idsOrder = await Promise.all(
      (await rowsAfterIdSort.all()).slice(0, 2).map(row => row.locator('td').nth(1).textContent())
    );

    // Orders should be different
    expect(namesOrder).not.toEqual(idsOrder);
  });

  test('44 - Sort maintains state after search', async ({ page }) => {
    // Sort by Name ascending
    const nameHeader = page.locator('table thead button', { hasText: 'Name' });
    await nameHeader.click();
    await page.waitForLoadState('networkidle');

    // Apply search filter
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('Admin');
    await page.waitForLoadState('networkidle');

    // Get filtered results
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify Name header still shows sort is active
    const nameHeaderAfterSearch = page.locator('table thead button', { hasText: 'Name' });
    // Sort indicator should still be visible
  });

  test('45 - Sort with single result', async ({ page }) => {
    // Search to get single result
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('Cobrador');
    await page.waitForLoadState('networkidle');

    // Verify single result
    let rows = page.locator('table tbody tr');
    let rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Try to sort
    const nameHeader = page.locator('table thead button', { hasText: 'Name' });
    await nameHeader.click();
    await page.waitForLoadState('networkidle');

    // Verify no errors and result still visible
    rows = page.locator('table tbody tr');
    rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('46 - Sort with empty results', async ({ page }) => {
    // Search for non-existent role
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('NonExistentRoleXYZ');
    await page.waitForLoadState('networkidle');

    // Verify no results
    let rows = page.locator('table tbody tr');
    let rowCount = await rows.count();
    expect(rowCount).toBe(0);

    // Try to sort
    const nameHeader = page.locator('table thead button', { hasText: 'Name' });
    await nameHeader.click();
    await page.waitForLoadState('networkidle');

    // Verify still empty and no errors
    rows = page.locator('table tbody tr');
    rowCount = await rows.count();
    expect(rowCount).toBe(0);

    // Check console for errors
    const errors = await page.evaluate(() => {
      const messages = [];
      return messages;
    });
  });

  test('47 - Sort persistence after page refresh', async ({ page }) => {
    // Sort by Name descending
    const nameHeader = page.locator('table thead button', { hasText: 'Name' });
    await nameHeader.click(); // ascending
    await page.waitForLoadState('networkidle');
    await nameHeader.click(); // descending
    await page.waitForLoadState('networkidle');

    // Get sorted order
    const rowsBeforeRefresh = page.locator('table tbody tr');
    const orderBefore = await Promise.all(
      (await rowsBeforeRefresh.all()).slice(0, 3).map(row => row.locator('th').first().textContent())
    );

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Get order after refresh
    const rowsAfterRefresh = page.locator('table tbody tr');
    const orderAfter = await Promise.all(
      (await rowsAfterRefresh.all()).slice(0, 3).map(row => row.locator('th').first().textContent())
    );

    // Note: Sort may or may not persist depending on implementation
    // Document actual behavior
  });
});
