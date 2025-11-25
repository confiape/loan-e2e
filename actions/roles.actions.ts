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
  deleteConfirmBtn: "roles-btn-confirm-delete",

  // Inputs
  roleNameInput: "roles-input-name",
  searchInput: "roles-search-input",
  inheritedRolesSelect: "roles-multiselect-rolesId",
  permissionsSelect: "roles-multiselect-permissionsId",

  rolesMultiselectRolesIdSearch: "roles-multiselect-rolesId-search",
  rolesMultiselectRolesIdList: "roles-multiselect-rolesId-list",

  rolesMultiselectPermissionsIdSearch: "roles-multiselect-permissionsId-search",
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

/**
 * RoleActions class encapsulates all role-related UI interactions
 */
export class RoleActions {
  constructor(private page: Page) {}

  // ==================== Public Methods ====================

  /**
   * Navigate to the roles page
   */
  async navigateTo(): Promise<void> {
    await this.page.goto("/roles");
    await expect(this.page.getByTestId(roleTestIds.table)).toBeVisible();
  }

  /**
   * Create a new role with the provided data
   */
  async create(roleData: RoleData): Promise<void> {
    await this.navigateTo();
    await this.openNewModal();

    if (roleData.name) {
      await this.fillRoleName(roleData.name);
    }

    await this.selectInheritedRoles(roleData.inheritedRoles || []);
    await this.selectPermissions(roleData.permissions || []);

    await this.submit();
  }

  /**
   * Edit an existing role
   */
  async edit(originalName: string, newRoleData: RoleData): Promise<void> {
    await this.navigateTo();
    await this.openEditByName(originalName);

    if (newRoleData.name) {
      await this.fillRoleName(newRoleData.name);
    }

    await this.selectInheritedRoles(newRoleData.inheritedRoles || []);
    await this.selectPermissions(newRoleData.permissions || []);

    await this.submit();
  }

  /**
   * Delete a role by name
   */
  async delete(roleName: string): Promise<void> {
    await this.navigateTo();
    await this.clickDeleteByName(roleName);
  }

  /**
   * Verify that a role exists in the table
   */
  async verifyExists(roleName: string): Promise<void> {
    await this.navigateTo();
    const row = await this.findRowByName(roleName);
    await expect(row).toBeVisible();
  }

  /**
   * Verify that a role does not exist in the table
   */
  async verifyNotExists(roleName: string): Promise<void> {
    const row = await this.findRowByName(roleName);
    expect(await row?.count()).toBe(0);
  }

  /**
   * Verify that specific inherited roles are selected
   */
  async verifyInheritedRolesSelected(
    roleName: string,
    roleNames: string[]
  ): Promise<void> {
    await this.openEditByName(roleName);
    await this.verifyMultiselectOptions(
      roleTestIds.inheritedRolesSelect,
      roleTestIds.rolesMultiselectRolesIdSearch,
      roleTestIds.rolesMultiselectRolesIdList,
      roleNames,
      true
    );
  }

  /**
   * Verify that specific inherited roles are not selected
   */
  async verifyInheritedRolesNotSelected(
    roleName: string,
    roleNames: string[]
  ): Promise<void> {
    await this.openEditByName(roleName);
    await this.verifyMultiselectOptions(
      roleTestIds.inheritedRolesSelect,
      roleTestIds.rolesMultiselectRolesIdSearch,
      roleTestIds.rolesMultiselectRolesIdList,
      roleNames,
      false
    );
  }

  /**
   * Verify that specific permissions are selected
   */
  async verifyPermissionsSelected(
    roleName: string,
    permissionNames: string[]
  ): Promise<void> {
    await this.openEditByName(roleName);
    await this.verifyMultiselectOptions(
      roleTestIds.permissionsSelect,
      roleTestIds.rolesMultiselectPermissionsIdSearch,
      roleTestIds.rolesMultiselectPermissionsIdList,
      permissionNames,
      true
    );
  }

  /**
   * Verify that specific permissions are not selected
   */
  async verifyPermissionsNotSelected(
    roleName: string,
    permissionNames: string[]
  ): Promise<void> {
    await this.openEditByName(roleName);
    await this.verifyMultiselectOptions(
      roleTestIds.permissionsSelect,
      roleTestIds.rolesMultiselectPermissionsIdSearch,
      roleTestIds.rolesMultiselectPermissionsIdList,
      permissionNames,
      false
    );
  }

  /**
   * Check if the submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    const btn = this.page.getByTestId(roleTestIds.submitBtn);
    return !(await btn.isDisabled());
  }

  // ==================== Private Methods ====================

  /**
   * Open the "New Role" modal
   */
  private async openNewModal(): Promise<void> {
    await this.page.getByTestId(roleTestIds.newRoleBtn).click();
    await expect(this.page.getByTestId(roleTestIds.modal)).toBeVisible();
  }

  /**
   * Open edit modal for a role by name
   */
  async openEditByName(roleName: string): Promise<void> {
    const row = await this.findRowByName(roleName);
    await row?.getByRole("button", { name: "Edit" }).click();
  }

  /**
   * Click delete button for a role by name
   */
  async clickDeleteByName(roleName: string): Promise<void> {
    const row = await this.findRowByName(roleName);
    await row?.getByRole("button", { name: "Delete" }).click();
  }

  /**
   * Find a role row by name in the table
   */
  async findRowByName(name: string): Promise<Locator> {
    await this.page.getByTestId(roleTestIds.searchInput).fill(name);
    return this.page.getByRole("rowheader", { name, exact: true }).locator("..");
  }

  /**
   * Fill the role name input
   */
  private async fillRoleName(name: string): Promise<void> {
    await this.page.getByTestId(roleTestIds.roleNameInput).fill(name);
  }

  /**
   * Select inherited roles from the multiselect dropdown
   */
  private async selectInheritedRoles(roleNames: string[]): Promise<void> {
    await this.selectMultiselectOptions(
      roleTestIds.inheritedRolesSelect,
      roleTestIds.rolesMultiselectRolesIdSearch,
      roleTestIds.rolesMultiselectRolesIdList,
      roleNames
    );
  }

  /**
   * Select permissions from the multiselect dropdown
   */
  private async selectPermissions(permissionNames: string[]): Promise<void> {
    await this.selectMultiselectOptions(
      roleTestIds.permissionsSelect,
      roleTestIds.rolesMultiselectPermissionsIdSearch,
      roleTestIds.rolesMultiselectPermissionsIdList,
      permissionNames
    );
  }

  /**
   * Generic method to select options from a multiselect dropdown
   */
  private async selectMultiselectOptions(
    selectorTestId: string,
    searchTestId: string,
    listTestId: string,
    options: string[]
  ): Promise<void> {
    if (options.length === 0) return;

    await this.page.getByTestId(selectorTestId).click();

    for (const option of options) {
      await this.page.getByTestId(searchTestId).clear();
      await this.page.getByTestId(searchTestId).fill(option);
      await this.page
        .getByTestId(listTestId)
        .getByText(option, { exact: true })
        .click();
    }

    await this.page.getByTestId(selectorTestId).click();
  }

  /**
   * Generic method to verify options in a multiselect dropdown
   */
  private async verifyMultiselectOptions(
    selectorTestId: string,
    searchTestId: string,
    listTestId: string,
    options: string[],
    shouldBeChecked: boolean
  ): Promise<void> {
    await this.page.getByTestId(selectorTestId).click();

    for (const option of options) {
      await this.page.getByTestId(searchTestId).clear();
      await this.page.getByTestId(searchTestId).fill(option);

      const element = this.page
        .getByTestId(listTestId)
        .getByText(option, { exact: true });

      if (shouldBeChecked) {
        await expect(element).toBeChecked();
      } else {
        await expect(element).not.toBeChecked();
      }
    }

    await this.page.getByTestId(selectorTestId).click();
  }

  /**
   * Submit the form
   */
  private async submit(): Promise<void> {
    await this.page.getByTestId(roleTestIds.submitBtn).click();
    await this.page.waitForLoadState("networkidle");
  }
}
