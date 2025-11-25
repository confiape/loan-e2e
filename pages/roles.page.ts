import { Page, expect } from '@playwright/test';

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
    await this.page.goto('/roles');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify the roles page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    const heading = this.page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible();
  }

  /**
   * Get all roles from table
   */
  async getAllRoles(): Promise<string[]> {
    const rows = this.page.locator('tbody tr, [role="row"]');
    const roles: string[] = [];
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const roleNameCell = row.locator('td').nth(1);
      const roleName = await roleNameCell.textContent();
      if (roleName) {
        roles.push(roleName.trim());
      }
    }

    return roles;
  }

  /**
   * Click New Role button
   */
  async clickNewRoleButton(): Promise<void> {
    const btn = this.page.locator('[id*="new"], [class*="new"], button:has-text("New Role")').first();
    await btn.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get role count in table
   */
  async getRoleCount(): Promise<number> {
    const rows = this.page.locator('tbody tr, [role="row"]');
    return await rows.count();
  }

  /**
   * Find role in table by name
   */
  async findRoleByName(roleName: string): Promise<any> {
    const rows = this.page.locator('tbody tr, [role="row"]');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const text = await row.textContent();
      if (text?.includes(roleName)) {
        return row;
      }
    }

    return null;
  }

  /**
   * Delete role by clicking delete button on its row
   */
  async deleteRole(roleName: string): Promise<void> {
    const row = await this.findRoleByName(roleName);
    if (!row) {
      throw new Error(`Role ${roleName} not found`);
    }

    const deleteBtn = row.locator('button[id*="delete"], button:has-text("Delete")').first();
    await deleteBtn.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Confirm deletion
   */
  async confirmDelete(): Promise<void> {
    const confirmBtn = this.page.locator('button:has-text("Delete")').last();
    await confirmBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Cancel modal
   */
  async cancelOperation(): Promise<void> {
    const cancelBtn = this.page.locator('button:has-text("Cancel")').last();
    await cancelBtn.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if role exists in table
   */
  async roleExists(roleName: string): Promise<boolean> {
    const tableContent = await this.page.locator('table, [role="table"]').first().textContent();
    return !!tableContent?.includes(roleName);
  }
}
