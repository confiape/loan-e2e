import { Page, expect } from '@playwright/test';
import {
  navigateToRoles,
  openNewRoleModal,
  fillRoleName,
  selectInheritedRoles,
  selectPermissions,
  submitCreateRole,
  submitUpdateRole,
  clickCancelModal,
  searchRoleByName,
  findRoleRowByName,
  editRoleByName,
  getRoleNameValue,
  verifyRoleExistsInTable,
  verifyRoleNotInTable,
  isCreateButtonEnabled,
  isUpdateButtonEnabled,
  roleTestIds,
} from '../actions/roles.actions';

/**
 * Roles Page Object
 * Provides high-level methods for role management testing
 */
export class RolesPage {
  constructor(private page: Page) {}

  /**
   * Navigate to roles page
   */
  async goto(): Promise<void> {
    await navigateToRoles(this.page);
  }

  /**
   * Verify the roles page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.page.locator('h1, h2').filter({ hasText: /Roles/i })).toBeVisible();
    await expect(this.page.getByTestId(roleTestIds.newRoleBtn)).toBeVisible();
    await expect(this.page.getByTestId(roleTestIds.table)).toBeVisible();
  }

  /**
   * Create a new role with full details
   */
  async createRole(
    name: string,
    options?: {
      inheritedRoles?: string[];
      permissions?: string[];
    },
  ): Promise<void> {
    await openNewRoleModal(this.page);
    await fillRoleName(this.page, name);

    if (options?.inheritedRoles && options.inheritedRoles.length > 0) {
      await selectInheritedRoles(this.page, options.inheritedRoles);
    }

    if (options?.permissions && options.permissions.length > 0) {
      await selectPermissions(this.page, options.permissions);
    }

    await submitCreateRole(this.page);
  }

  /**
   * Create a minimal role (only name)
   */
  async createMinimalRole(name: string): Promise<void> {
    await this.createRole(name);
  }

  /**
   * Edit an existing role
   */
  async editRole(
    currentName: string,
    updates: {
      newName?: string;
      inheritedRoles?: string[];
      permissions?: string[];
    },
  ): Promise<void> {
    await editRoleByName(this.page, currentName);

    if (updates.newName) {
      await fillRoleName(this.page, updates.newName);
    }

    if (updates.inheritedRoles) {
      await selectInheritedRoles(this.page, updates.inheritedRoles);
    }

    if (updates.permissions) {
      await selectPermissions(this.page, updates.permissions);
    }

    await submitUpdateRole(this.page);
  }

  /**
   * Search for a role by name
   */
  async searchRole(name: string): Promise<void> {
    await searchRoleByName(this.page, name);
  }

  /**
   * Clear the search filter
   */
  async clearSearch(): Promise<void> {
    const searchInput = this.page.getByTestId(roleTestIds.searchInput);
    await searchInput.clear();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify role is visible in table
   */
  async verifyRoleVisible(name: string): Promise<void> {
    await verifyRoleExistsInTable(this.page, name);
  }

  /**
   * Verify role is NOT visible in table
   */
  async verifyRoleHidden(name: string): Promise<void> {
    await verifyRoleNotInTable(this.page, name);
  }

  /**
   * Verify Create button is enabled
   */
  async verifyCreateButtonEnabled(): Promise<void> {
    const enabled = await isCreateButtonEnabled(this.page);
    expect(enabled).toBe(true);
  }

  /**
   * Verify Create button is disabled
   */
  async verifyCreateButtonDisabled(): Promise<void> {
    const enabled = await isCreateButtonEnabled(this.page);
    expect(enabled).toBe(false);
  }

  /**
   * Verify Update button is enabled
   */
  async verifyUpdateButtonEnabled(): Promise<void> {
    const enabled = await isUpdateButtonEnabled(this.page);
    expect(enabled).toBe(true);
  }

  /**
   * Verify Update button is disabled
   */
  async verifyUpdateButtonDisabled(): Promise<void> {
    const enabled = await isUpdateButtonEnabled(this.page);
    expect(enabled).toBe(false);
  }

  /**
   * Verify modal is closed
   */
  async verifyModalClosed(): Promise<void> {
    await expect(this.page.getByLabel(/Create Role|Edit Role|New Role/)).not.toBeVisible();
  }

  /**
   * Cancel create/edit operation
   */
  async cancelOperation(): Promise<void> {
    await clickCancelModal(this.page);
    await this.verifyModalClosed();
  }

  /**
   * Get current role name from input
   */
  async getCurrentRoleName(): Promise<string> {
    return getRoleNameValue(this.page);
  }
}
