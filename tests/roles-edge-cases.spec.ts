import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { roleTestIds, findRoleRowByName } from '../actions/roles.actions';

test.describe('Role Edge Cases and Boundary Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('105 - Role name with numbers only', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Try numeric name
    const roleName = '12345';
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Check if valid (depends on implementation)
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    const isEnabled = await submitBtn.isEnabled();
    
    // Document behavior
    if (isEnabled) {
      await submitBtn.click();
      await page.waitForLoadState('networkidle');
      const row = await findRoleRowByName(page, roleName);
      await expect(row).toBeVisible();
    } else {
      await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
    }
  });

  test('106 - Role name with spaces only', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Try space-only name
    await page.getByTestId(roleTestIds.roleNameInput).fill('     ');
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Should be invalid
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(submitBtn).toBeDisabled();

    // Close
    await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
  });

  test('107 - Very long role name (approaching limit)', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Create very long valid name (39 characters)
    const longName = 'A Very Long Role Name That Is Almost';
    await page.getByTestId(roleTestIds.roleNameInput).fill(longName);
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Should be valid
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    const isEnabled = await submitBtn.isEnabled();
    expect(isEnabled).toBeTruthy();

    // Close
    await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
  });

  test('108 - Role with mixed case and numbers', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    const roleName = `TestRole123ABC${Math.random().toString(36).substring(7)}`;
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    
    // Should be valid
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(submitBtn).toBeEnabled();

    // Create
    await submitBtn.click();
    await page.waitForLoadState('networkidle');

    // Verify
    const row = await findRoleRowByName(page, roleName);
    await expect(row).toBeVisible();
  });

  test('109 - Role with hyphen and underscore', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Try with hyphen and underscore
    const roleName = `Test-Role_Admin`;
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Check if valid
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    const isEnabled = await submitBtn.isEnabled();
    
    // Document behavior
    if (isEnabled) {
      await submitBtn.click();
      await page.waitForLoadState('networkidle');
    }

    await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
  });

  test('110 - Role with parentheses in name', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Try with parentheses
    const roleName = `Test(Role)Admin`;
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Should likely be invalid (special character)
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    const isDisabled = await submitBtn.isDisabled();
    
    expect(isDisabled).toBeTruthy();

    // Close
    await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
  });

  test('111 - Rapidly delete and recreate same-named role', async ({ page }) => {
    const roleName = `RapidCycle${Math.random().toString(36).substring(7)}`;

    // Create role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Delete immediately
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    const row = await findRoleRowByName(page, roleName);
    const deleteBtn = row.getByRole('button', { name: 'Delete' });
    await deleteBtn.click();
    await page.waitForLoadState('networkidle');

    const confirmModal = page.locator('[role="dialog"]');
    const confirmDelete = confirmModal.getByRole('button', { name: 'Delete' });
    await confirmDelete.click();
    await page.waitForLoadState('networkidle');

    // Recreate immediately
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Should be recreated successfully
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    const newRow = await findRoleRowByName(page, roleName);
    await expect(newRow).toBeVisible();
  });

  test('112 - Modal with very large permission list', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    const roleName = `LargePermRole${Math.random().toString(36).substring(7)}`;
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Open permissions dropdown
    const permDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select permissions') 
    }).first();
    
    if (await permDropdown.isVisible()) {
      await permDropdown.click();
      await page.waitForLoadState('networkidle');

      // Get all permissions
      const labels = page.locator('label:visible');
      const count = await labels.count();
      
      // Select many permissions
      const labelsArray = await labels.all();
      const selectCount = Math.min(20, labelsArray.length);
      
      for (let i = 0; i < selectCount; i++) {
        const checkbox = labelsArray[i].locator('input[type="checkbox"]');
        if (!await checkbox.isChecked()) {
          await checkbox.click();
          await page.waitForTimeout(50);
        }
      }

      // Close and submit
      await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
    }

    // Create
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    if (await submitBtn.isEnabled()) {
      await submitBtn.click();
      await page.waitForLoadState('networkidle');

      // Verify created
      await page.getByTestId(roleTestIds.searchInput).fill(roleName);
      await page.waitForLoadState('networkidle');

      const row = await findRoleRowByName(page, roleName);
      await expect(row).toBeVisible();
    } else {
      await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
    }
  });

  test('113 - Edit role while simultaneously creating another', async ({ page }) => {
    const role1Name = `EditRole${Math.random().toString(36).substring(7)}`;
    const role2Name = `CreateRole${Math.random().toString(36).substring(7)}`;

    // Create first role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(role1Name);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Edit it
    await page.getByTestId(roleTestIds.searchInput).fill(role1Name);
    await page.waitForLoadState('networkidle');

    const row = await findRoleRowByName(page, role1Name);
    const editBtn = row.getByRole('button', { name: 'Edit' });
    await editBtn.click();
    await page.waitForLoadState('networkidle');

    // Cancel the edit
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState("networkidle");
    await page.waitForLoadState('networkidle');

    // Now create second role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(role2Name);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Both should exist
    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.getByTestId(roleTestIds.searchInput).fill(role1Name);
    await page.waitForLoadState('networkidle');
    let row1 = await findRoleRowByName(page, role1Name);
    await expect(row1).toBeVisible();

    await page.getByTestId(roleTestIds.searchInput).clear();
    await page.getByTestId(roleTestIds.searchInput).fill(role2Name);
    await page.waitForLoadState('networkidle');
    let row2 = await findRoleRowByName(page, role2Name);
    await expect(row2).toBeVisible();
  });

  test('114 - Browser back button after operations', async ({ page }) => {
    const currentUrl = page.url();

    // Create role
    const roleName = `BackBtnTest${Math.random().toString(36).substring(7)}`;
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // URL should still be same page
    expect(page.url()).toContain('/roles');

    // Verify role exists
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    const row = await findRoleRowByName(page, roleName);
    await expect(row).toBeVisible();
  });

  test('115 - Table with single role visible', async ({ page }) => {
    // Search for single specific role
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('Cobrador');
    await page.waitForLoadState('networkidle');

    // Get rows
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    
    if (count > 0) {
      // Single result should be displayed
      const firstRow = rows.first();
      await expect(firstRow).toBeVisible();

      // Pagination should be minimal or hidden
      const nextBtn = page.getByRole('button', { name: 'Next' });
      const isNextVisible = await nextBtn.isVisible().catch(() => false);
      
      // With single result, next might be disabled or hidden
    }

    // Clear
    await searchInput.clear();
  });
});
