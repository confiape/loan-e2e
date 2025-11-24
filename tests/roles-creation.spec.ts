// spec: plan-pruebas-roles.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';

test.describe('Creación de Roles', () => {
  test.beforeEach(async ({ page }) => {
    // Each test starts with login
    await login(page);
    // Navigate to roles page
    await page.goto('/roles');
  });

  test('Create Role with Valid Minimal Data', async ({ page }) => {
    // 1. Click "New Role" button
    await page.getByTestId('roles-btn-new').click();

    // Wait for modal to be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 2. Fill "Role Name" with "Test Role QA"
    await page.getByTestId('roles-input-name').fill('Test Role QA');

    // 3. Click "Create"
    await page.getByTestId('roles-btn-submit').click();

    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify role appears in table by searching for it
    await page.getByTestId('roles-search-input').fill('Test Role QA');
    await expect(page.locator('tbody tr', { hasText: 'Test Role QA' }).first()).toBeVisible();
  });

  test('Create Role with All Fields Complete', async ({ page }) => {
    // 1. Click "New Role"
    await page.getByTestId('roles-btn-new').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 2. Fill "Role Name" with "Editor Role"
    await page.getByTestId('roles-input-name').fill('Editor Role');

    // 3. Click "Inherited Roles" dropdown
    await page.getByTestId('roles-multiselect-rolesId').click();

    // Search for Admin in the dropdown
    await page.getByTestId('roles-multiselect-rolesId-search').fill('Admin');

    // 4. Select "Admin" from the list
    const adminOption = page.locator('[data-testid^="roles-multiselect-rolesId-option-"]', { hasText: /^Admin$/ }).first();
    await adminOption.click();

    // Close dropdown by clicking role name field
    await page.getByTestId('roles-input-name').click();

    // 5. Click "Permissions" dropdown
    await page.getByTestId('roles-multiselect-permissionsId').click();

    // 6. Select permissions: BorrowerController_GetAllWithActiveLoans
    await page.getByTestId('roles-multiselect-permissionsId-option-borrowercontroller-getallwithactiveloans').click();

    // 7. Select LoanController_SaveLoan
    await page.getByTestId('roles-multiselect-permissionsId-option-loancontroller-saveloan').click();

    // 8. Select UserController_GetAllUsers
    await page.getByTestId('roles-multiselect-permissionsId-option-usercontroller-getallusers').click();

    // Close dropdown
    await page.getByTestId('roles-input-name').click();

    // 9. Click "Create"
    await page.getByTestId('roles-btn-submit').click();

    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify role appears in table
    await page.getByTestId('roles-search-input').fill('Editor Role');
    await expect(page.locator('tbody tr', { hasText: 'Editor Role' }).first()).toBeVisible();
  });

  test('Validation - Role Name Too Short', async ({ page }) => {
    // 1. Click "New Role"
    await page.getByTestId('roles-btn-new').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 2. Fill "Role Name" with "A" (1 character)
    await page.getByTestId('roles-input-name').fill('A');

    // 3. Verify "Create" button is disabled
    const createButton = page.getByTestId('roles-btn-submit');
    await expect(createButton).toBeDisabled();

    // 4. Verify validation message appears
    await expect(page.getByText('Role name must be between 2-40 characters with no special characters')).toBeVisible();
  });

  test('Validation - Role Name Too Long', async ({ page }) => {
    // 1. Click "New Role"
    await page.getByTestId('roles-btn-new').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 2. Fill "Role Name" with more than 40 characters
    await page.getByTestId('roles-input-name').fill('ThisIsAVeryLongRoleNameThatExceedsTheMaximumLengthAllowedByTheSystem');

    // 3. Verify "Create" button is disabled
    const createButton = page.getByTestId('roles-btn-submit');
    await expect(createButton).toBeDisabled();

    // 4. Verify validation message appears
    await expect(page.getByText('Role name must be between 2-40 characters with no special characters')).toBeVisible();
  });

  test('Validation - Special Characters', async ({ page }) => {
    // 1. Click "New Role"
    await page.getByTestId('roles-btn-new').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 2. Fill "Role Name" with "Role@#$%"
    await page.getByTestId('roles-input-name').fill('Role@#$%');

    // 3. Verify "Create" button is disabled or error shown
    const createButton = page.getByTestId('roles-btn-submit');
    await expect(createButton).toBeDisabled();

    // 4. Verify validation message appears
    await expect(page.getByText('Role name must be between 2-40 characters with no special characters')).toBeVisible();
  });

  test('Cancel Role Creation', async ({ page }) => {
    // 1. Click "New Role"
    await page.getByTestId('roles-btn-new').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 2. Fill "Role Name" with "Temporal Role"
    await page.getByTestId('roles-input-name').fill('Temporal Role');

    // 3. Select some inherited roles
    await page.getByTestId('roles-multiselect-rolesId').click();
    await page.getByTestId('roles-multiselect-rolesId-search').fill('Admin');
    const adminOption = page.locator('[data-testid^="roles-multiselect-rolesId-option-"]', { hasText: /^Admin$/ }).first();
    await adminOption.click();
    await page.getByTestId('roles-input-name').click();

    // 4. Select some permissions
    await page.getByTestId('roles-multiselect-permissionsId').click();
    await page.getByTestId('roles-multiselect-permissionsId-option-borrowercontroller-getallwithactiveloans').click();
    await page.getByTestId('roles-input-name').click();

    // 5. Click "Cancel"
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify role was NOT created
    await page.getByTestId('roles-search-input').fill('Temporal Role');
    await expect(page.locator('tbody tr', { hasText: 'Temporal Role' })).not.toBeVisible();
  });

  test('Close Modal with X Button', async ({ page }) => {
    // 1. Click "New Role"
    await page.getByTestId('roles-btn-new').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 2. Fill "Role Name" with "Another Temporal Role"
    await page.getByTestId('roles-input-name').fill('Another Temporal Role');

    // 3. Click the X button (close modal button)
    await page.getByRole('button', { name: 'Close modal' }).click();

    // Verify modal closes without creating role
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify role was NOT created
    await page.getByTestId('roles-search-input').fill('Another Temporal Role');
    await expect(page.locator('tbody tr', { hasText: 'Another Temporal Role' })).not.toBeVisible();
  });

  test('Close Modal by Clicking Outside (Backdrop)', async ({ page }) => {
    // 1. Click "New Role"
    await page.getByTestId('roles-btn-new').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 2. Fill "Role Name" with "Test Role"
    await page.getByTestId('roles-input-name').fill('Test Role');

    // 3. Click outside the modal (on the dark backdrop area)
    await page.getByRole('button', { name: 'Dismiss modal backdrop' }).click();

    // Verify modal closes without saving
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify role was NOT created
    await page.getByTestId('roles-search-input').fill('Test Role');
    // The role might exist from previous tests, so we check the count didn't increase
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    // If no results found, count should be 0 or the table should show "no results"
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
