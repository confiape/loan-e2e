import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { faker } from '@faker-js/faker';

// Helper function to generate unique role names
function generateUniqueName(): string {
  const adjective = faker.word.adjective().charAt(0).toUpperCase() + faker.word.adjective().slice(1);
  const noun = faker.word.noun().charAt(0).toUpperCase() + faker.word.noun().slice(1);
  const digits = Math.floor(Math.random() * 90000) + 10000;
  return `TestRole_${adjective}${noun}${digits}`;
}

test.describe('Role Creation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('1 - Create role with name, inherited role and permissions', async ({ page }) => {
    const roleName = generateUniqueName();

    // Click New Role button
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });

    // Fill role name
    await page.getByTestId('roles-input-name').fill(roleName);

    // Select inherited role
    await page.getByTestId('roles-multiselect-rolesId').click();
    await page.getByRole('option', { name: /Admin/i }).click();
    await page.keyboard.press('Escape');

    // Select permissions
    await page.getByTestId('roles-multiselect-permissionsId').click();
    await page.getByRole('option', { name: /UserController_GetAllUsers/i }).click();
    await page.getByRole('option', { name: /UserController_SaveUser/i }).click();
    await page.keyboard.press('Escape');

    // Click Create
    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    // Search for the role
    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');

    // Verify role exists
    const roleRow = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(roleRow).toBeVisible();
  });

  test('2 - Create role with only name', async ({ page }) => {
    const roleName = generateUniqueName();

    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });

    await page.getByTestId('roles-input-name').fill(roleName);
    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');

    const roleRow = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(roleRow).toBeVisible();
  });

  test('3 - Validate empty role name field', async ({ page }) => {
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });

    const createBtn = page.getByTestId('roles-btn-create');
    await expect(createBtn).toBeDisabled();
  });

  test('4 - Validate role name too short (1 character)', async ({ page }) => {
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });

    await page.getByTestId('roles-input-name').fill('A');
    await page.keyboard.press('Tab');

    const createBtn = page.getByTestId('roles-btn-create');
    await expect(createBtn).toBeDisabled();
  });

  test('5 - Validate role name exactly 2 characters (valid)', async ({ page }) => {
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });

    await page.getByTestId('roles-input-name').fill('IT');

    const createBtn = page.getByTestId('roles-btn-create');
    await expect(createBtn).toBeEnabled();
  });

  test('6 - Create role with multiple inherited roles', async ({ page }) => {
    const roleName = generateUniqueName();

    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });

    await page.getByTestId('roles-input-name').fill(roleName);

    await page.getByTestId('roles-multiselect-rolesId').click();
    await page.getByRole('option', { name: /Admin/i }).click();
    await page.getByRole('option', { name: /Cobrador/i }).click();
    await page.getByRole('option', { name: /Administrador de Finanzas/i }).click();
    await page.keyboard.press('Escape');

    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');

    const roleRow = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(roleRow).toBeVisible();
  });

  test('7 - Create role with multiple permissions', async ({ page }) => {
    const roleName = generateUniqueName();

    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });

    await page.getByTestId('roles-input-name').fill(roleName);

    await page.getByTestId('roles-multiselect-permissionsId').click();
    await page.getByRole('option', { name: /ReportsController_ReportPaymentByDay/i }).click();
    await page.getByRole('option', { name: /ReportsController_ReportPaymentByLoan/i }).click();
    await page.getByRole('option', { name: /ReportsController_ReportLoansByClientId/i }).click();
    await page.keyboard.press('Escape');

    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');

    const roleRow = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(roleRow).toBeVisible();
  });

  test('8 - Cancel role creation', async ({ page }) => {
    const cancelName = 'TestCancel123';

    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });

    await page.getByTestId('roles-input-name').fill(cancelName);
    await page.getByTestId('roles-btn-cancel').click();
    await page.waitForSelector('dialog', { state: 'hidden' });

    await page.getByTestId('roles-search-input').fill(cancelName);
    await page.waitForLoadState('networkidle');

    const roleRow = page.locator('table tbody tr').filter({ hasText: cancelName });
    await expect(roleRow).not.toBeVisible();
  });

  test('9 - Close modal with Escape key', async ({ page }) => {
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });

    await page.getByTestId('roles-input-name').fill('TestEscape');
    await page.keyboard.press('Escape');

    const modal = page.locator('dialog');
    await expect(modal).not.toBeVisible();
  });
});
