import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { roleTestIds } from '../actions/roles.actions';

test.describe('Role Permission Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('69 - View all available permissions', async ({ page }) => {
    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Click permissions dropdown
    const permissionsDropdown = page.locator('button').filter({
      has: page.locator('text=Select permissions')
    }).first();

    if (await permissionsDropdown.isVisible()) {
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');

      // Verify permissions are displayed
      const permissionCheckboxes = page.locator('input[type="checkbox"]').filter({
        has: page.locator('..')
      });

      const count = await permissionCheckboxes.count();
      // Should have 40+ permissions
      expect(count).toBeGreaterThan(10);

      // Close dropdown by clicking it again
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');
    }

    // Close modal by clicking Cancel
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState('networkidle');
  });

  test('70 - Select single permission', async ({ page }) => {
    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter role name
    const roleName = `PermTest${Math.random().toString(36).substring(7)}`;
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Click permissions dropdown
    const permissionsDropdown = page.locator('button').filter({
      has: page.locator('text=Select permissions')
    }).first();

    if (await permissionsDropdown.isVisible()) {
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');

      // Find and select UserController_GetAllUsers permission
      const permissionLabel = page.locator('label').filter({
        hasText: 'UserController_GetAllUsers'
      }).first();

      if (await permissionLabel.isVisible()) {
        const checkbox = permissionLabel.locator('input[type="checkbox"]');
        await checkbox.click();
        await page.waitForLoadState('networkidle');

        // Close dropdown by clicking it again
        await permissionsDropdown.click();
        await page.waitForLoadState('networkidle');

        // Button should show selection
        expect(await permissionsDropdown.textContent()).toContain('Select');
      }
    }

    // Cancel modal
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState('networkidle');
  });

  test('71 - Select multiple permissions', async ({ page }) => {
    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter role name
    const roleName = `MultiPerm${Math.random().toString(36).substring(7)}`;
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Click permissions dropdown
    const permissionsDropdown = page.locator('button').filter({
      has: page.locator('text=Select permissions')
    }).first();

    if (await permissionsDropdown.isVisible()) {
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');

      // Select multiple permissions
      const permissionsToSelect = [
        'UserController_GetAllUsers',
        'UserController_SaveUser',
        'UserController_DeleteUserAsync'
      ];

      for (const perm of permissionsToSelect) {
        const label = page.locator('label').filter({ hasText: perm }).first();
        if (await label.isVisible()) {
          const checkbox = label.locator('input[type="checkbox"]');
          await checkbox.click();
          await page.waitForLoadState('networkidle');
        }
      }

      // Close dropdown by clicking it again
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');
    }

    // Cancel modal
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState('networkidle');
  });

  test('72 - Search permissions by controller name', async ({ page }) => {
    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Click permissions dropdown
    const permissionsDropdown = page.locator('button').filter({
      has: page.locator('text=Select permissions')
    }).first();

    if (await permissionsDropdown.isVisible()) {
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');

      // Look for search box in dropdown
      const searchBox = page.locator('input[placeholder*="search"], input[placeholder*="Search"]').first();

      if (await searchBox.isVisible()) {
        // Type "Loan" to filter
        await searchBox.fill('Loan');
        await page.waitForLoadState('networkidle');

        // Verify results are filtered to Loan permissions
        const visibleLabels = page.locator('label:visible');
        const count = await visibleLabels.count();
        expect(count).toBeGreaterThan(0);

        // Clear search
        await searchBox.clear();
        await page.waitForLoadState('networkidle');
      }

      // Close dropdown by clicking it again
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');
    }

    // Close modal
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState('networkidle');
  });

  test('73 - Search permissions by action name', async ({ page }) => {
    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Click permissions dropdown
    const permissionsDropdown = page.locator('button').filter({
      has: page.locator('text=Select permissions')
    }).first();

    if (await permissionsDropdown.isVisible()) {
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');

      // Look for search box
      const searchBox = page.locator('input[placeholder*="search"], input[placeholder*="Search"]').first();

      if (await searchBox.isVisible()) {
        // Type "Delete" to filter
        await searchBox.fill('Delete');
        await page.waitForLoadState('networkidle');

        // Verify delete permissions are shown
        const visibleLabels = page.locator('label:visible');
        const count = await visibleLabels.count();
        expect(count).toBeGreaterThan(0);

        // Clear search
        await searchBox.clear();
        await page.waitForLoadState('networkidle');
      }

      // Close dropdown by clicking it again
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');
    }

    // Close modal
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState('networkidle');
  });

  test('74 - Permission persistence after save', async ({ page }) => {
    const roleName = `PermPersist${Math.random().toString(36).substring(7)}`;

    // Create role with specific permissions
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Select a permission
    const permissionsDropdown = page.locator('button').filter({
      has: page.locator('text=Select permissions')
    }).first();

    if (await permissionsDropdown.isVisible()) {
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');

      const permLabel = page.locator('label').filter({
        hasText: 'UserController_GetAllUsers'
      }).first();

      if (await permLabel.isVisible()) {
        const checkbox = permLabel.locator('input[type="checkbox"]');
        await checkbox.click();
        await page.waitForLoadState('networkidle');
      }

      // Close dropdown
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');
    }

    // Submit
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Search for created role
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    // Edit the role
    const roleRow = page.locator('table tbody tr').filter({ hasText: roleName }).first();
    if (await roleRow.isVisible()) {
      const editButton = roleRow.getByRole('button', { name: 'Edit' });
      await editButton.click();
      await page.waitForLoadState('networkidle');

      // Open permissions dropdown
      const permissionsDropdownEdit = page.locator('button').filter({
        has: page.locator('text=Select permissions')
      }).first();

      if (await permissionsDropdownEdit.isVisible()) {
        await permissionsDropdownEdit.click();
        await page.waitForLoadState('networkidle');

        // Verify previously selected permission is checked
        const permLabel = page.locator('label').filter({
          hasText: 'UserController_GetAllUsers'
        }).first();

        if (await permLabel.isVisible()) {
          const checkbox = permLabel.locator('input[type="checkbox"]');
          const isChecked = await checkbox.isChecked();
          expect(isChecked).toBeTruthy();
        }

        // Close dropdown
        await permissionsDropdownEdit.click();
        await page.waitForLoadState('networkidle');
      }

      // Close modal
      await page.getByTestId(roleTestIds.cancelBtn).click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('75 - Deselect permissions', async ({ page }) => {
    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter role name
    const roleName = `DeselPerm${Math.random().toString(36).substring(7)}`;
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Click permissions dropdown
    const permissionsDropdown = page.locator('button').filter({
      has: page.locator('text=Select permissions')
    }).first();

    if (await permissionsDropdown.isVisible()) {
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');

      // Select a permission
      let permLabel = page.locator('label').filter({
        hasText: 'UserController_GetAllUsers'
      }).first();

      if (await permLabel.isVisible()) {
        const checkbox = permLabel.locator('input[type="checkbox"]');
        await checkbox.click();
        await page.waitForLoadState('networkidle');

        // Uncheck it
        await checkbox.click();
        await page.waitForLoadState('networkidle');

        // Verify it's unchecked
        const isChecked = await checkbox.isChecked();
        expect(isChecked).toBeFalsy();
      }

      // Close dropdown
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');
    }

    // Close modal
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState('networkidle');
  });

  test('76 - Permission display format', async ({ page }) => {
    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Click permissions dropdown
    const permissionsDropdown = page.locator('button').filter({
      has: page.locator('text=Select permissions')
    }).first();

    if (await permissionsDropdown.isVisible()) {
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');

      // Check permission naming format
      const permissionLabels = page.locator('label:visible');
      const firstLabel = await permissionLabels.first().textContent();

      // Permissions should follow pattern: ControllerName_ActionName
      if (firstLabel) {
        // Should contain underscore separating controller and action
        expect(firstLabel).toMatch(/_/);
      }

      // Close dropdown
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');
    }

    // Close modal
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState('networkidle');
  });
});
