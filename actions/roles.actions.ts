import { Page, expect } from '@playwright/test';

/**
 * Common locators and actions for Roles module
 */

// Common Test IDs
export const roleTestIds = {
  // Buttons
  newRoleBtn: 'roles-btn-new',
  cancelBtn: 'roles-btn-cancel',
  createBtn: 'roles-btn-create',
  updateBtn: 'roles-btn-update',
  deleteBtn: 'roles-btn-delete',
  deleteConfirmBtn: 'roles-btn-delete-confirm',

  // Inputs
  roleNameInput: 'roles-input-name',
  searchInput: 'roles-search-input',
  inheritedRolesSelect: 'roles-multiselect-rolesId',
  permissionsSelect: 'roles-multiselect-permissionsId',

  // Table
  table: 'roles-table',
  selectAllCheckbox: 'roles-table-select-all',
};

/**
 * Navigate to roles page
 */
export async function navigateToRoles(page: Page): Promise<void> {
  await page.goto('/roles');
  await page.waitForLoadState('networkidle');
}

/**
 * Open the "New Role" modal
 */
export async function openNewRoleModal(page: Page): Promise<void> {
  await page.getByTestId(roleTestIds.newRoleBtn).click();
  await page.getByLabel(/New Role|Create Role/).waitFor({ state: 'visible' });
}

/**
 * Fill role name input
 */
export async function fillRoleName(page: Page, name: string): Promise<void> {
  const input = page.getByTestId(roleTestIds.roleNameInput);
  await input.clear();
  await input.fill(name);
}

/**
 * Get the current role name value from input
 */
export async function getRoleNameValue(page: Page): Promise<string> {
  const input = page.getByTestId(roleTestIds.roleNameInput);
  return input.inputValue();
}

/**
 * Select inherited roles from dropdown
 */
export async function selectInheritedRoles(page: Page, roleNames: string[]): Promise<void> {
  const dropdown = page.getByTestId(roleTestIds.inheritedRolesSelect);
  await dropdown.click();

  for (const roleName of roleNames) {
    const option = page.getByRole('option', { name: new RegExp(roleName, 'i') });
    await option.click();
  }

  // Close dropdown by clicking outside
  await page.keyboard.press('Escape');
}

/**
 * Select permissions from dropdown
 */
export async function selectPermissions(page: Page, permissionNames: string[]): Promise<void> {
  const dropdown = page.getByTestId(roleTestIds.permissionsSelect);
  await dropdown.click();

  for (const permissionName of permissionNames) {
    const option = page.getByRole('option', { name: new RegExp(permissionName, 'i') });
    await option.click();
  }

  // Close dropdown
  await page.keyboard.press('Escape');
}

/**
 * Click Create button in modal
 */
export async function submitCreateRole(page: Page): Promise<void> {
  const createBtn = page.getByTestId(roleTestIds.createBtn);
  await createBtn.click();

  // Wait for modal to close and table to update
  await page.waitForLoadState('networkidle');
}

/**
 * Click Update button in edit modal
 */
export async function submitUpdateRole(page: Page): Promise<void> {
  const updateBtn = page.getByTestId(roleTestIds.updateBtn);
  await updateBtn.click();

  // Wait for update to complete
  await page.waitForLoadState('networkidle');
}

/**
 * Click Cancel button in modal
 */
export async function clickCancelModal(page: Page): Promise<void> {
  const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
  await cancelBtn.click();
}

/**
 * Search for a role by name in the search box
 */
export async function searchRoleByName(page: Page, name: string): Promise<void> {
  const searchInput = page.getByTestId(roleTestIds.searchInput);
  await searchInput.clear();
  await searchInput.fill(name);
  await page.waitForLoadState('networkidle');
}

/**
 * Find a role row by name in the table
 */
export async function findRoleRowByName(page: Page, name: string) {
  const rows = page.locator('table tbody tr');
  const count = await rows.count();

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const text = await row.textContent();
    if (text && text.includes(name)) {
      return row;
    }
  }

  return null;
}

/**
 * Get Edit button for a specific role by name
 */
export async function getEditButtonForRole(page: Page, roleName: string) {
  const row = await findRoleRowByName(page, roleName);
  if (!row) {
    throw new Error(`Role "${roleName}" not found in table`);
  }
  return row.getByTestId(/roles-table-action-edit/);
}

/**
 * Click Edit button for a specific role
 */
export async function editRoleByName(page: Page, roleName: string): Promise<void> {
  const editBtn = await getEditButtonForRole(page, roleName);
  await editBtn.click();

  // Wait for modal to open
  await page.getByLabel(/Edit Role/).waitFor({ state: 'visible' });
}

/**
 * Get Delete button for a specific role
 */
export async function getDeleteButtonForRole(page: Page, roleName: string) {
  const row = await findRoleRowByName(page, roleName);
  if (!row) {
    throw new Error(`Role "${roleName}" not found in table`);
  }
  return row.getByTestId(/roles-table-action-delete/);
}

/**
 * Verify role exists in table
 */
export async function verifyRoleExistsInTable(page: Page, roleName: string): Promise<void> {
  const row = await findRoleRowByName(page, roleName);
  expect(row).not.toBeNull();
}

/**
 * Verify role does not exist in table
 */
export async function verifyRoleNotInTable(page: Page, roleName: string): Promise<void> {
  const row = await findRoleRowByName(page, roleName);
  expect(row).toBeNull();
}

/**
 * Get Create button and check if it's enabled
 */
export async function isCreateButtonEnabled(page: Page): Promise<boolean> {
  const createBtn = page.getByTestId(roleTestIds.createBtn);
  return !(await createBtn.isDisabled());
}

/**
 * Get Update button and check if it's enabled
 */
export async function isUpdateButtonEnabled(page: Page): Promise<boolean> {
  const updateBtn = page.getByTestId(roleTestIds.updateBtn);
  return !(await updateBtn.isDisabled());
}
