import { type Page, expect } from '@playwright/test';
import { login } from './auth.actions';

/**
 * Reusable role management actions
 * These are higher-level flows that combine multiple interactions
 */

export interface RoleData {
  name: string;
  inheritedRoles?: string[];
  permissions?: string[];
}

export interface RoleIdCapture {
  id: string;
  name: string;
}

/**
 * Navigate to roles page (with login)
 */
export async function navigateToRoles(page: Page): Promise<void> {
  await login(page);
  await page.goto('/roles');
  await page.waitForLoadState('networkidle');
}

/**
 * Create a new role and optionally capture its ID from network response
 */
export async function createRole(
  page: Page,
  roleData: RoleData,
  captureId: boolean = false
): Promise<RoleIdCapture | null> {
  let capturedRole: RoleIdCapture | null = null;

  // Set up response listener if we need to capture ID
  if (captureId) {
    page.on('response', async (response) => {
      if (response.url().includes('/api/user/save-role') && response.status() === 200) {
        try {
          const responseBody = await response.json();
          if (responseBody && responseBody.id) {
            capturedRole = {
              id: responseBody.id,
              name: roleData.name
            };
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    });
  }

  // Click New Role button
  await page.getByRole('button', { name: /new role/i }).click();

  // Wait for modal to be visible
  await page.locator('[role="dialog"]').waitFor({ state: 'visible' });

  // Fill role name
  await page.getByLabel(/role name/i).fill(roleData.name);

  // Select inherited roles if provided
  if (roleData.inheritedRoles && roleData.inheritedRoles.length > 0) {
    await page.getByRole('button', { name: /inherited roles/i }).click();
    for (const roleName of roleData.inheritedRoles) {
      await page.getByRole('option', { name: roleName }).click();
    }
    // Click outside to close dropdown
    await page.getByLabel(/role name/i).click();
  }

  // Select permissions if provided
  if (roleData.permissions && roleData.permissions.length > 0) {
    await page.getByRole('button', { name: /permissions/i }).click();
    for (const permission of roleData.permissions) {
      await page.getByRole('option', { name: permission }).click();
    }
    // Click outside to close dropdown
    await page.getByLabel(/role name/i).click();
  }

  // Submit the form
  await page.getByRole('button', { name: /^create$/i }).click();

  // Wait for modal to close
  await page.locator('[role="dialog"]').waitFor({ state: 'hidden' });

  // Wait a bit for the response to be captured
  if (captureId) {
    await page.waitForTimeout(500);
  }

  return capturedRole;
}

/**
 * Edit an existing role by clicking the edit button
 */
export async function editRoleByButton(
  page: Page,
  roleName: string,
  updates: Partial<RoleData>
): Promise<void> {
  // Find the role row and click edit
  const roleRow = page.locator('tr', { has: page.locator('td', { hasText: roleName }) });
  await roleRow.getByRole('button', { name: /edit/i }).click();

  // Wait for modal
  await page.locator('[role="dialog"]').waitFor({ state: 'visible' });

  // Update name if provided
  if (updates.name) {
    await page.getByLabel(/role name/i).clear();
    await page.getByLabel(/role name/i).fill(updates.name);
  }

  // Update inherited roles if provided
  if (updates.inheritedRoles !== undefined) {
    // This would need more complex logic to handle adding/removing
    // For now, we'll just handle adding
    if (updates.inheritedRoles.length > 0) {
      await page.getByRole('button', { name: /inherited roles/i }).click();
      for (const roleName of updates.inheritedRoles) {
        await page.getByRole('option', { name: roleName }).click();
      }
      await page.getByLabel(/role name/i).click();
    }
  }

  // Update permissions if provided
  if (updates.permissions !== undefined && updates.permissions.length > 0) {
    await page.getByRole('button', { name: /permissions/i }).click();
    for (const permission of updates.permissions) {
      await page.getByRole('option', { name: permission }).click();
    }
    await page.getByLabel(/role name/i).click();
  }

  // Submit the update
  await page.getByRole('button', { name: /^update$/i }).click();

  // Wait for modal to close
  await page.locator('[role="dialog"]').waitFor({ state: 'hidden' });
}

/**
 * Edit a role by ID (direct URL navigation)
 */
export async function editRoleById(
  page: Page,
  roleId: string,
  updates: Partial<RoleData>
): Promise<void> {
  await page.goto(`/roles/${roleId}`);
  await page.locator('[role="dialog"]').waitFor({ state: 'visible' });

  // Same update logic as editRoleByButton
  if (updates.name) {
    await page.getByLabel(/role name/i).clear();
    await page.getByLabel(/role name/i).fill(updates.name);
  }

  if (updates.inheritedRoles !== undefined && updates.inheritedRoles.length > 0) {
    await page.getByRole('button', { name: /inherited roles/i }).click();
    for (const roleName of updates.inheritedRoles) {
      await page.getByRole('option', { name: roleName }).click();
    }
    await page.getByLabel(/role name/i).click();
  }

  if (updates.permissions !== undefined && updates.permissions.length > 0) {
    await page.getByRole('button', { name: /permissions/i }).click();
    for (const permission of updates.permissions) {
      await page.getByRole('option', { name: permission }).click();
    }
    await page.getByLabel(/role name/i).click();
  }

  await page.getByRole('button', { name: /^update$/i }).click();
  await page.locator('[role="dialog"]').waitFor({ state: 'hidden' });
}

/**
 * Delete a role by name
 */
export async function deleteRole(page: Page, roleName: string): Promise<void> {
  const roleRow = page.locator('tr', { has: page.locator('td', { hasText: roleName }) });
  await roleRow.getByRole('button', { name: /delete/i }).click();

  // Handle confirmation dialog if it exists
  const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
  if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmButton.click();
  }

  // Wait for the role to be removed from the table
  await expect(roleRow).not.toBeVisible({ timeout: 5000 });
}

/**
 * Search for roles
 */
export async function searchRoles(page: Page, searchTerm: string): Promise<void> {
  await page.getByPlaceholder(/search/i).fill(searchTerm);
  // Wait for search to take effect
  await page.waitForTimeout(500);
}

/**
 * Clear search
 */
export async function clearSearch(page: Page): Promise<void> {
  await page.getByPlaceholder(/search/i).clear();
  await page.waitForTimeout(500);
}

/**
 * Select multiple roles using checkboxes
 */
export async function selectRoles(page: Page, roleNames: string[]): Promise<void> {
  for (const roleName of roleNames) {
    const roleRow = page.locator('tr', { has: page.locator('td', { hasText: roleName }) });
    await roleRow.locator('input[type="checkbox"]').check();
  }
}

/**
 * Select all visible roles
 */
export async function selectAllRoles(page: Page): Promise<void> {
  await page.locator('thead input[type="checkbox"]').check();
}

/**
 * Delete selected roles
 */
export async function deleteSelectedRoles(page: Page): Promise<void> {
  await page.getByRole('button', { name: /delete selected/i }).click();

  // Handle confirmation dialog
  const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
  if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmButton.click();
  }

  await page.waitForTimeout(500);
}

/**
 * Clear all selections
 */
export async function clearAllSelections(page: Page): Promise<void> {
  await page.getByRole('button', { name: /clear all/i }).click();
}

/**
 * Sort by column
 */
export async function sortBy(page: Page, columnName: 'Name' | 'ID'): Promise<void> {
  await page.getByRole('button', { name: columnName }).click();
  await page.waitForTimeout(300);
}

/**
 * Navigate to next page
 */
export async function goToNextPage(page: Page): Promise<void> {
  await page.getByRole('button', { name: /next/i }).click();
  await page.waitForTimeout(300);
}

/**
 * Navigate to previous page
 */
export async function goToPreviousPage(page: Page): Promise<void> {
  await page.getByRole('button', { name: /previous/i }).click();
  await page.waitForTimeout(300);
}

/**
 * Get role ID by intercepting network request
 * This should be called BEFORE the action that triggers the role creation/update
 */
export async function setupRoleIdCapture(page: Page): Promise<() => Promise<string | null>> {
  let capturedId: string | null = null;

  const responseHandler = async (response: any) => {
    if (response.url().includes('/api/user/save-role') && response.status() === 200) {
      try {
        const responseBody = await response.json();
        if (responseBody && responseBody.id) {
          capturedId = responseBody.id;
        }
      } catch (e) {
        // Ignore errors
      }
    }
  };

  page.on('response', responseHandler);

  // Return a function that retrieves the captured ID
  return async () => {
    // Wait a bit to ensure response was captured
    await page.waitForTimeout(500);
    page.off('response', responseHandler);
    return capturedId;
  };
}

/**
 * Verify role exists in table
 */
export async function verifyRoleExists(page: Page, roleName: string): Promise<void> {
  const roleRow = page.locator('tr', { has: page.locator('td', { hasText: roleName }) });
  await expect(roleRow).toBeVisible();
}

/**
 * Verify role does not exist in table
 */
export async function verifyRoleNotExists(page: Page, roleName: string): Promise<void> {
  const roleRow = page.locator('tr', { has: page.locator('td', { hasText: roleName }) });
  await expect(roleRow).not.toBeVisible();
}

/**
 * Get the count of visible roles
 */
export async function getVisibleRoleCount(page: Page): Promise<number> {
  const rows = page.locator('tbody tr');
  return await rows.count();
}

/**
 * Verify pagination info text
 */
export async function verifyPaginationInfo(
  page: Page,
  start: number,
  end: number,
  total: number
): Promise<void> {
  const paginationText = `Showing ${start}-${end} of ${total}`;
  await expect(page.getByText(paginationText)).toBeVisible();
}
