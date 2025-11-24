// spec: plan-pruebas-roles.md - Section 4: Búsqueda y Filtrado de Roles
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';

test.describe('Búsqueda y Filtrado de Roles', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
  });

  test('4.1 - Search by Exact Role Name', async ({ page }) => {
    // 1. First CREATE a unique role called "UniqueSearchRole123"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('UniqueSearchRole123');
    await page.getByTestId('roles-btn-submit').click();

    // 2. In search field, type "UniqueSearchRole123"
    await page.getByTestId('roles-search-input').pressSequentially('UniqueSearchRole123');

    // 3. Verify table updates in real-time
    // 4. Verify only roles containing that text are shown
    // 5. Verify the created role appears in results
    await expect(page.getByText('UniqueSearchRole123')).toBeVisible();
    
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(1);
  });

  test('4.2 - Search by Partial Name', async ({ page }) => {
    // 1. First CREATE a role called "SearchPartialTest"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('SearchPartialTest');
    await page.getByTestId('roles-btn-submit').click();

    // 2. In search field, type "Partial"
    await page.getByTestId('roles-search-input').fill('Partial');

    // 3. Verify table shows all roles containing "Partial" in name
    // 4. Verify the created role appears
    await expect(page.getByText('SearchPartialTest')).toBeVisible();
  });

  test('4.3 - Search with No Results', async ({ page }) => {
    // 1. In search field, type "XYZNoExiste123456789"
    await page.getByTestId('roles-search-input').fill('XYZNoExiste123456789');

    // 2. Verify table is empty
    // 3. Verify "No results found" or similar message appears
    await expect(page.getByText('No data available')).toBeVisible();
    
    // 4. Verify counter shows 0 results (table body should have only the "no data" row)
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(1);
  });

  test('4.5 - Search - Clear Search Field', async ({ page }) => {
    // 1. First CREATE a role "ClearSearchTest"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('ClearSearchTest');
    await page.getByTestId('roles-btn-submit').click();

    // 2. Type "ClearSearchTest" in search field
    await page.getByTestId('roles-search-input').fill('ClearSearchTest');

    // 3. Verify table is filtered
    await expect(page.getByText('ClearSearchTest')).toBeVisible();
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(1);

    // 4. Clear the search field (delete all text)
    await page.getByTestId('roles-search-input').fill('');

    // 5. Verify table shows all roles again
    // 6. Verify the role count is restored
    await expect(page.getByText(/Showing 1-10 of \d+/)).toBeVisible();
    await expect(tableRows).not.toHaveCount(1);
  });

  test('4.6 - Search Case-Insensitive', async ({ page }) => {
    // 1. First CREATE a role "CaseTestRole"
    await page.getByTestId('roles-btn-new').click();
    await page.getByTestId('roles-input-name').fill('CaseTestRole');
    await page.getByTestId('roles-btn-submit').click();

    // 2. Type "casetestrole" (lowercase) in search field
    await page.getByTestId('roles-search-input').fill('casetestrole');

    // 3. Verify search finds the role regardless of case
    // 4. Verify "CaseTestRole" appears in results
    await expect(page.getByText('CaseTestRole')).toBeVisible();
  });

  test('4.8 - Search and Pagination', async ({ page }) => {
    // 1. Create 15 roles with similar names: "SearchPage1" through "SearchPage15"
    for (let i = 1; i <= 15; i++) {
      await page.getByTestId('roles-btn-new').click();
      await page.getByTestId('roles-input-name').fill(`SearchPage${i}`);
      await page.getByTestId('roles-btn-submit').click();
    }

    // 2. Search for "SearchPage"
    await page.getByTestId('roles-search-input').fill('SearchPage');

    // 3. Verify results are paginated (showing more than 10 results)
    await expect(page.getByText(/Showing 1-10 of 15/)).toBeVisible();

    // 4. Verify pagination controls appear
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeEnabled();

    // 5. Verify can navigate between pages of search results
    await nextButton.click();
    await expect(page.getByText(/Showing 11-15 of 15/)).toBeVisible();
    
    // Verify some roles from page 2
    await expect(page.getByText('SearchPage11')).toBeVisible();
    
    // Navigate back
    const previousButton = page.getByRole('button', { name: /previous/i });
    await expect(previousButton).toBeEnabled();
    await previousButton.click();
    await expect(page.getByText(/Showing 1-10 of 15/)).toBeVisible();
  });

  test('4.9 - Search and Multi-Select', async ({ page }) => {
    // 1. Create 3 roles: "SelectSearch1", "SelectSearch2", "SelectSearch3"
    for (let i = 1; i <= 3; i++) {
      await page.getByTestId('roles-btn-new').click();
      await page.getByTestId('roles-input-name').fill(`SelectSearch${i}`);
      await page.getByTestId('roles-btn-submit').click();
    }

    // 2. Search for "SelectSearch"
    await page.getByTestId('roles-search-input').fill('SelectSearch');

    // Verify only 3 results
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(3);

    // 3. Click "Select all" checkbox
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]');
    await selectAllCheckbox.check();

    // 4. Verify only the 3 filtered roles are selected
    // 5. Verify selection bar shows "Selected (3):"
    await expect(page.getByText(/Selected \(3\):/)).toBeVisible();

    // 6. Verify the 3 created roles appear in selection
    await expect(page.getByText('SelectSearch1')).toBeVisible();
    await expect(page.getByText('SelectSearch2')).toBeVisible();
    await expect(page.getByText('SelectSearch3')).toBeVisible();
    
    // Verify all checkboxes in filtered results are checked
    const rowCheckboxes = page.locator('tbody tr input[type="checkbox"]');
    const count = await rowCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked();
    }
  });
});
