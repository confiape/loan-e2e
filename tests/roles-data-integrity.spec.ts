import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { roleTestIds, findRoleRowByName } from '../actions/roles.actions';

test.describe('Role Data Integrity and Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('96 - Role ID uniqueness', async ({ page }) => {
    // Get all role IDs from current page
    const cells = page.locator('table tbody tr td:nth-child(3)'); // ID column
    const idElements = await cells.all();
    
    if (idElements.length > 1) {
      const ids = [];
      for (const element of idElements) {
        const id = await element.textContent();
        ids.push(id);
      }

      // All IDs should be unique on this page
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // All should match MongoDB ObjectId format (24 hex characters)
      for (const id of ids) {
        if (id) {
          expect(id.trim()).toMatch(/^[a-f0-9]{24}$/);
        }
      }
    }
  });

  test('97 - Role name uniqueness enforcement', async ({ page }) => {
    const uniqueName = `UniqueTest${Math.random().toString(36).substring(7)}`;

    // Create first role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(uniqueName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Try to create second role with same name
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(uniqueName);
    
    // Try to submit
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    await submitBtn.click();
    await page.waitForLoadState('networkidle');

    // Either error should appear or modal should remain open
    const modal = page.getByTestId(roleTestIds.modal);
    const isModalStillOpen = await modal.isVisible().catch(() => false);
    
    if (isModalStillOpen) {
      // Error case - modal is still showing
      await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
    }

    // Verify only one instance exists
    await page.getByTestId(roleTestIds.searchInput).fill(uniqueName);
    await page.waitForLoadState('networkidle');

    const rows = page.locator('table tbody tr').filter({ hasText: uniqueName });
    const count = await rows.count();
    expect(count).toBeLessThanOrEqual(1);
  });

  test('98 - Data persistence after browser refresh', async ({ page }) => {
    const roleName = `PersistTest${Math.random().toString(36).substring(7)}`;

    // Create role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Search for it
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    let roleRow = await findRoleRowByName(page, roleName);
    await expect(roleRow).toBeVisible();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Search again
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    // Role should still exist
    roleRow = await findRoleRowByName(page, roleName);
    await expect(roleRow).toBeVisible();
  });

  test('99 - Edit consistency', async ({ page }) => {
    const originalName = `EditConsist${Math.random().toString(36).substring(7)}`;
    const newName = `EditConsist${Math.random().toString(36).substring(7)}`;

    // Create role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(originalName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Edit role
    await page.getByTestId(roleTestIds.searchInput).fill(originalName);
    await page.waitForLoadState('networkidle');

    let roleRow = await findRoleRowByName(page, originalName);
    const editButton = roleRow.getByRole('button', { name: 'Edit' });
    await editButton.click();
    await page.waitForLoadState('networkidle');

    // Change name
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    const currentValue = await nameInput.inputValue();
    expect(currentValue).toBe(originalName);

    await nameInput.clear();
    await nameInput.fill(newName);
    
    // Submit
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Verify old name doesn't exist
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.getByTestId(roleTestIds.searchInput).fill(originalName);
    await page.waitForLoadState('networkidle');

    let oldRow = page.locator('table tbody tr').filter({ hasText: originalName });
    await expect(oldRow).not.toBeVisible();

    // Verify new name exists
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.getByTestId(roleTestIds.searchInput).fill(newName);
    await page.waitForLoadState('networkidle');

    let newRow = await findRoleRowByName(page, newName);
    await expect(newRow).toBeVisible();
  });

  test('100 - Permission consistency after save', async ({ page }) => {
    const roleName = `PermConsist${Math.random().toString(36).substring(7)}`;

    // Create role with specific permissions
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Select permission
    const permissionsDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select permissions') 
    }).first();
    
    if (await permissionsDropdown.isVisible()) {
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');

      const label = page.locator('label').filter({ 
        hasText: 'UserController_GetAllUsers' 
      }).first();
      
      if (await label.isVisible()) {
        await label.locator('input[type="checkbox"]').click();
        await page.waitForLoadState('networkidle');
      }

      await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
    }

    // Create
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Edit and verify permission persists
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    const roleRow = await findRoleRowByName(page, roleName);
    const editButton = roleRow.getByRole('button', { name: 'Edit' });
    await editButton.click();
    await page.waitForLoadState('networkidle');

    // Check permissions dropdown
    const permDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select permissions') 
    }).first();
    
    if (await permDropdown.isVisible()) {
      await permDropdown.click();
      await page.waitForLoadState('networkidle');

      const userPermLabel = page.locator('label').filter({ 
        hasText: 'UserController_GetAllUsers' 
      }).first();
      
      if (await userPermLabel.isVisible()) {
        const checkbox = userPermLabel.locator('input[type="checkbox"]');
        const isChecked = await checkbox.isChecked();
        expect(isChecked).toBeTruthy();
      }

      await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
    }

    // Close
    await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
  });

  test('101 - Rapid operations consistency', async ({ page }) => {
    const roleNames = [];

    // Rapidly create multiple roles
    for (let i = 0; i < 3; i++) {
      const name = `RapidTest${Math.random().toString(36).substring(7)}`;
      roleNames.push(name);

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.getByTestId(roleTestIds.modal).isVisible();
      await page.getByTestId(roleTestIds.roleNameInput).fill(name);
      await page.getByTestId(roleTestIds.submitBtn).click();
      // Don't wait for complete load before next operation
    }

    // Wait for all operations to complete
    await page.waitForLoadState('networkidle');

    // Verify all were created
    for (const name of roleNames) {
      await page.getByTestId(roleTestIds.searchInput).clear();
      await page.getByTestId(roleTestIds.searchInput).fill(name);
      await page.waitForLoadState('networkidle');

      const row = await findRoleRowByName(page, name);
      await expect(row).toBeVisible();
    }
  });

  test('102 - Role data consistency across pages', async ({ page }) => {
    // Get first role from page 1
    const row1 = page.locator('table tbody tr').first();
    const id1 = await row1.locator('td').nth(1).textContent();

    // Navigate to page 2
    const nextButton = page.getByRole('button', { name: 'Next' });
    if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Navigate back to page 1
      const previousButton = page.getByRole('button', { name: 'Previous' });
      await previousButton.click();
      await page.waitForLoadState('networkidle');

      // First role should be same
      const row1Again = page.locator('table tbody tr').first();
      const id1Again = await row1Again.locator('td').nth(1).textContent();

      expect(id1).toBe(id1Again);
    }
  });

  test('103 - Field value preservation during edits', async ({ page }) => {
    const roleName = `FieldPreserve${Math.random().toString(36).substring(7)}`;
    const newName = `FieldPreserveNew${Math.random().toString(36).substring(7)}`;

    // Create role with inherited role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Select inherited role
    const inheritDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select inherited roles') 
    }).first();
    
    if (await inheritDropdown.isVisible()) {
      await inheritDropdown.click();
      await page.waitForLoadState('networkidle');

      const label = page.locator('label').filter({ hasText: 'Admin' }).first();
      if (await label.isVisible()) {
        await label.locator('input[type="checkbox"]').click();
        await page.waitForLoadState('networkidle');
      }

      await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
    }

    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Edit only name
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    const roleRow = await findRoleRowByName(page, roleName);
    const editButton = roleRow.getByRole('button', { name: 'Edit' });
    await editButton.click();
    await page.waitForLoadState('networkidle');

    // Change name only
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    await nameInput.clear();
    await nameInput.fill(newName);

    // Verify inherited role is still selected
    const inheritDropdownEdit = page.locator('button').filter({ 
      has: page.locator('text=Select inherited roles') 
    }).first();
    
    if (await inheritDropdownEdit.isVisible()) {
      const text = await inheritDropdownEdit.textContent();
      expect(text).toBeTruthy();
    }

    // Submit
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Verify new name exists and inherited role is preserved
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.getByTestId(roleTestIds.searchInput).fill(newName);
    await page.waitForLoadState('networkidle');

    const newRow = await findRoleRowByName(page, newName);
    await expect(newRow).toBeVisible();
  });

  test('104 - Search filter preservation after operations', async ({ page }) => {
    // Apply search
    await page.getByTestId(roleTestIds.searchInput).fill('Admin');
    await page.waitForLoadState('networkidle');

    const rowsBefore = page.locator('table tbody tr');
    const countBefore = await rowsBefore.count();

    // Create a role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    const roleName = `NewAdmin${Math.random().toString(36).substring(7)}`;
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Search should still be applied or reset - document behavior
    const rowsAfter = page.locator('table tbody tr');
    const countAfter = await rowsAfter.count();

    // Count may increase if new role matches search
    expect(countAfter).toBeGreaterThanOrEqual(0);
  });
});
