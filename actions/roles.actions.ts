import { Locator, Page, expect } from "@playwright/test";

/**
 * Common locators and actions for Roles module
 */

// Common Test IDs
export const roleTestIds = {
  // Buttons
  newRoleBtn: "roles-btn-new",
  cancelBtn: "roles-btn-cancel",
  submitBtn: "roles-btn-submit",

  updateBtn: "roles-btn-update",
  deleteBtn: "roles-btn-delete",
  deleteConfirmBtn: "roles-btn-delete-confirm",

  // Inputs
  roleNameInput: "roles-input-name",
  searchInput: "roles-search-input",
  inheritedRolesSelect: "roles-multiselect-rolesId",
  permissionsSelect: "roles-multiselect-permissionsId",

  rolesMultiselectRolesIdSearch: "roles-multiselect-rolesId-search",
  rolesMultiselectRolesIdList: "roles-multiselect-rolesId-list",

  rolesMUltiselectPermissionsIdSearch: "roles-multiselect-permissionsId-search",
  rolesMultiselectPermissionsIdList: "roles-multiselect-permissionsId-list",

  // Table
  table: "roles-table",
  selectAllCheckbox: "roles-table-select-all",

  // Modal
  modal: "roles-modal",
};

export interface RoleData {
  name?: string;
  inheritedRoles?: string[];
  permissions?: string[];
}

export async function createRole(page: Page, roleData: RoleData): Promise<void> {
  await page.goto("/roles");
  await openNewRoleModal(page);
  
  // Fill role name
  if( roleData.name ){
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleData.name);
  }

  await selectInheritedRoles(page, roleData.inheritedRoles || []);
  await selectPermissions(page, roleData.permissions || []);
  
  // Click Create
  await page.getByTestId(roleTestIds.submitBtn).click();
  await page.waitForLoadState('networkidle');
}
export async function editRole(page: Page, originalName: string, newRoleData:RoleData): Promise<void> {

  await openEditRolesByName(page, originalName);

  // Update role name if provided
  if( newRoleData.name ){
    await page.getByTestId(roleTestIds.roleNameInput).fill(newRoleData.name);
  }
  await selectInheritedRoles(page, newRoleData.inheritedRoles || []);
  await selectPermissions(page, newRoleData.permissions || []);
  await page.getByTestId(roleTestIds.submitBtn).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to roles page
 */
export async function navigateToRoles(page: Page): Promise<void> {
  await page.goto("/roles");
  await page.getByTestId(roleTestIds.table).isVisible();
}

/**
 * Open the "New Role" modal
 */
export async function openNewRoleModal(page: Page): Promise<void> {
  await page.getByTestId(roleTestIds.newRoleBtn).click();
  await page.getByTestId(roleTestIds.modal).isVisible();
}

/**
 * Select inherited roles from dropdown
 */
export async function selectInheritedRoles(
  page: Page,
  roleNames: string[]
): Promise<void> {
  await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

  for (const roleName of roleNames) {
    await page
      .getByTestId(roleTestIds.rolesMultiselectRolesIdSearch)
      .fill(roleName);
    await page
      .getByTestId(roleTestIds.rolesMultiselectRolesIdList)
      .getByText(roleName, {exact: true})
      .click();
  }

  // Close dropdown by clicking outside
  await page.getByTestId(roleTestIds.inheritedRolesSelect).click();
}


/**
 * Verify selected inherited roles 
 */
export async function verifyInheritedRoles(
  page: Page,
  roleName: string,
  roleNames: string[]
): Promise<void> {
  await openEditRolesByName(page, roleName);
  await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

  for (const roleName of roleNames) {
    await page
      .getByTestId(roleTestIds.rolesMultiselectRolesIdSearch)
      .fill(roleName);
    await page
      .getByTestId(roleTestIds.rolesMultiselectRolesIdList)
      .getByText(roleName, {exact: true})
      .isChecked();
  }

  // Close dropdown by clicking outside
  await page.getByTestId(roleTestIds.inheritedRolesSelect).click();
}

/**
 * Verify not selected inherited roles 
 */
export async function verifyNotInheritedRoles(
  page: Page,
  roleName: string,
  roleNames: string[]
): Promise<void> {
  await openEditRolesByName(page, roleName);
  await page.getByTestId(roleTestIds.inheritedRolesSelect).click();

  for (const roleName of roleNames) {
    await page
      .getByTestId(roleTestIds.rolesMultiselectRolesIdSearch)
      .fill(roleName);
    await expect(page
      .getByTestId(roleTestIds.rolesMultiselectRolesIdList)
      .getByText(roleName, {exact: true})).not.toBeChecked();
  }

  // Close dropdown by clicking outside
  await page.getByTestId(roleTestIds.inheritedRolesSelect).click();
}

/**
 * Select permissions from dropdown
 */
export async function selectPermissions(
  page: Page,
  permissionNames: string[]
): Promise<void> {
  await page.getByTestId(roleTestIds.permissionsSelect).click();

  for (const permissionName of permissionNames) {
    await page
      .getByTestId(roleTestIds.rolesMUltiselectPermissionsIdSearch)
      .fill(permissionName);
    await page
      .getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
      .getByText(permissionName)
      .click();
  }

  // Close dropdown
  await page.getByTestId(roleTestIds.permissionsSelect).click();
}

/**
 * Verify selected permissions from dropdown
 */
export async function verifyPermissions(
  page: Page,
  roleName: string,
  permissionNames: string[]
): Promise<void> {
  await openEditRolesByName(page, roleName);
  await page.getByTestId(roleTestIds.permissionsSelect).click();

  for (const permissionName of permissionNames) {
    await page
      .getByTestId(roleTestIds.rolesMUltiselectPermissionsIdSearch)
      .fill(permissionName);
    await page
      .getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
      .getByText(permissionName)
      .isChecked();
  }

  // Close dropdown
  await page.getByTestId(roleTestIds.permissionsSelect).click();
}

/**
 * Verify not selected permissions from dropdown
 */
export async function verifyNotPermissions(
  page: Page,
  roleName: string,
  permissionNames: string[]
): Promise<void> {
  await openEditRolesByName(page, roleName);
  await page.getByTestId(roleTestIds.permissionsSelect).click();

  for (const permissionName of permissionNames) {
    await page
      .getByTestId(roleTestIds.rolesMUltiselectPermissionsIdSearch)
      .fill(permissionName);
    await expect(page
      .getByTestId(roleTestIds.rolesMultiselectPermissionsIdList)
      .getByText(permissionName)).not.toBeChecked();
  }

  // Close dropdown
  await page.getByTestId(roleTestIds.permissionsSelect).click();
}
/**
 * Find a role row by name in the table
 */
export async function findRoleRowByName(
  page: Page,
  name: string
): Promise<Locator>  {
  await page.getByTestId(roleTestIds.searchInput).fill(name);
  return page.getByRole("rowheader", { name: name ,exact: true}).locator("..");
}

/**
 * Click Edit button for a specific role
 */
export async function openEditRolesByName(page: Page, roleName: string) {
  const row = await findRoleRowByName(page, roleName);
  await row?.getByRole("button", { name: "Edit" }).click();
}

/**
 * Get Delete button for a specific role
 */
export async function getDeleteButtonForRole(page: Page, roleName: string) {
  const row = await findRoleRowByName(page, roleName);
  await row?.getByText("Delete").click();
}

/**
 * Verify role exists in table
 */
export async function verifyRoleExistsInTable(
  page: Page,
  roleName: string
): Promise<void> {
  const row = await findRoleRowByName(page, roleName);
  await row?.isVisible();
}

/**
 * Verify role does not exist in table
 */
export async function verifyRoleNotInTable(
  page: Page,
  roleName: string
): Promise<void> {
  const row = await findRoleRowByName(page, roleName);
  expect(await row?.count()).toBe(0);
}

/**
 * Get Create button and check if it's enabled
 */
export async function isSubmitButtonEnabled(page: Page): Promise<boolean> {
  const createBtn = page.getByTestId(roleTestIds.submitBtn);
  return !(await createBtn.isDisabled());
}
