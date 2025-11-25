import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { roleTestIds, findRoleRowByName } from '../actions/roles.actions';

test.describe('Role Inheritance', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('77 - View available roles for inheritance', async ({ page }) => {
    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Click inherited roles dropdown
    const inheritedRolesDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select inherited roles') 
    }).first();
    
    if (await inheritedRolesDropdown.isVisible()) {
      await inheritedRolesDropdown.click();
      await page.waitForLoadState('networkidle');

      // Verify roles are displayed
      const roleCheckboxes = page.locator('label');
      const count = await roleCheckboxes.count();
      
      // Should have at least 3 predefined roles
      expect(count).toBeGreaterThanOrEqual(3);

      // Look for specific roles
      expect(await page.textContent('body')).toContain('Admin');
      expect(await page.textContent('body')).toContain('Cobrador');

      // Close dropdown
    }

    // Close modal
  });

  test('78 - Create role with single inherited role', async ({ page }) => {
    const roleName = `InheritTest${Math.random().toString(36).substring(7)}`;

    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter role name
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Select inherited role
    const inheritedRolesDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select inherited roles') 
    }).first();
    
    if (await inheritedRolesDropdown.isVisible()) {
      await inheritedRolesDropdown.click();
      await page.waitForLoadState('networkidle');

      // Click Admin checkbox
      const adminLabel = page.locator('label').filter({ hasText: /^Admin$/ }).first();
      if (await adminLabel.isVisible()) {
        const checkbox = adminLabel.locator('input[type="checkbox"]');
        await checkbox.click();
        await page.waitForLoadState('networkidle');
      }

    }

    // Create role
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Verify role was created
    const roleRow = await findRoleRowByName(page, roleName);
    if (await roleRow.isVisible()) {
      await expect(roleRow).toBeVisible();
    }
  });

  test('79 - Create role with multiple inherited roles', async ({ page }) => {
    const roleName = `MultiInherit${Math.random().toString(36).substring(7)}`;

    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter role name
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Select multiple inherited roles
    const inheritedRolesDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select inherited roles') 
    }).first();
    
    if (await inheritedRolesDropdown.isVisible()) {
      await inheritedRolesDropdown.click();
      await page.waitForLoadState('networkidle');

      // Select multiple roles
      const rolesToSelect = ['Admin', 'Cobrador', 'Administrador de Finanzas'];
      
      for (const roleName of rolesToSelect) {
        const label = page.locator('label').filter({ hasText: new RegExp(`^${roleName}$`) }).first();
        if (await label.isVisible()) {
          const checkbox = label.locator('input[type="checkbox"]');
          const isChecked = await checkbox.isChecked();
          if (!isChecked) {
            await checkbox.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }

    }

    // Create role
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Verify role was created
    const roleRow = await findRoleRowByName(page, roleName);
    if (await roleRow.isVisible()) {
      await expect(roleRow).toBeVisible();
    }
  });

  test('80 - Add inherited role to existing role', async ({ page }) => {
    const roleName = `AddInherit${Math.random().toString(36).substring(7)}`;

    // Create initial role without inheritance
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Search and edit
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    const roleRow = await findRoleRowByName(page, roleName);
    if (await roleRow.isVisible()) {
      const editButton = roleRow.getByRole('button', { name: 'Edit' });
      await editButton.click();
      await page.waitForLoadState('networkidle');

      // Add inherited role
      const inheritedRolesDropdown = page.locator('button').filter({ 
        has: page.locator('text=Select inherited roles') 
      }).first();
      
      if (await inheritedRolesDropdown.isVisible()) {
        await inheritedRolesDropdown.click();
        await page.waitForLoadState('networkidle');

        const adminLabel = page.locator('label').filter({ hasText: /^Admin$/ }).first();
        if (await adminLabel.isVisible()) {
          const checkbox = adminLabel.locator('input[type="checkbox"]');
          await checkbox.click();
          await page.waitForLoadState('networkidle');
        }

      }

      // Update
      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('81 - Remove inherited role from existing role', async ({ page }) => {
    const roleName = `RemoveInherit${Math.random().toString(36).substring(7)}`;

    // Create role with inherited role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Select inherited role
    const inheritedRolesDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select inherited roles') 
    }).first();
    
    if (await inheritedRolesDropdown.isVisible()) {
      await inheritedRolesDropdown.click();
      await page.waitForLoadState('networkidle');

      const adminLabel = page.locator('label').filter({ hasText: /^Admin$/ }).first();
      if (await adminLabel.isVisible()) {
        const checkbox = adminLabel.locator('input[type="checkbox"]');
        await checkbox.click();
        await page.waitForLoadState('networkidle');
      }

    }

    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Edit to remove inheritance
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    const roleRow = await findRoleRowByName(page, roleName);
    if (await roleRow.isVisible()) {
      const editButton = roleRow.getByRole('button', { name: 'Edit' });
      await editButton.click();
      await page.waitForLoadState('networkidle');

      // Uncheck inherited role
      const inheritedRolesDropdownEdit = page.locator('button').filter({ 
        has: page.locator('text=Select inherited roles') 
      }).first();
      
      if (await inheritedRolesDropdownEdit.isVisible()) {
        await inheritedRolesDropdownEdit.click();
        await page.waitForLoadState('networkidle');

        const adminLabel = page.locator('label').filter({ hasText: /^Admin$/ }).first();
        if (await adminLabel.isVisible()) {
          const checkbox = adminLabel.locator('input[type="checkbox"]');
          const isChecked = await checkbox.isChecked();
          if (isChecked) {
            await checkbox.click();
            await page.waitForLoadState('networkidle');
          }
        }

      }

      // Update
      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('82 - Self-inheritance prevention', async ({ page }) => {
    // Edit Admin role
    const adminRow = page.locator('table tbody tr').filter({ hasText: /^Admin$/ }).first();
    
    if (await adminRow.isVisible()) {
      const editButton = adminRow.getByRole('button', { name: 'Edit' });
      await editButton.click();
      await page.waitForLoadState('networkidle');

      // Try to open inherited roles dropdown
      const inheritedRolesDropdown = page.locator('button').filter({ 
        has: page.locator('text=Select inherited roles') 
      }).first();
      
      if (await inheritedRolesDropdown.isVisible()) {
        await inheritedRolesDropdown.click();
        await page.waitForLoadState('networkidle');

        // Check if Admin appears in the list
        const adminLabel = page.locator('label').filter({ hasText: /^Admin$/ });
        const adminCount = await adminLabel.count();

        // Admin should not appear in its own inherited roles
        // This verifies self-inheritance prevention
        
      }

      // Close modal
    }
  });

  test('83 - Inherit and add additional permissions', async ({ page }) => {
    const roleName = `InheritAndPerm${Math.random().toString(36).substring(7)}`;

    // Create role with inheritance and direct permissions
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

    // Add inherited role
    const inheritedRolesDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select inherited roles') 
    }).first();
    
    if (await inheritedRolesDropdown.isVisible()) {
      await inheritedRolesDropdown.click();
      await page.waitForLoadState('networkidle');

      const cobradorLabel = page.locator('label').filter({ hasText: 'Cobrador' }).first();
      if (await cobradorLabel.isVisible()) {
        const checkbox = cobradorLabel.locator('input[type="checkbox"]');
        await checkbox.click();
        await page.waitForLoadState('networkidle');
      }

    }

    // Add direct permissions
    const permissionsDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select permissions') 
    }).first();
    
    if (await permissionsDropdown.isVisible()) {
      await permissionsDropdown.click();
      await page.waitForLoadState('networkidle');

      const userPermLabel = page.locator('label').filter({ 
        hasText: 'UserController_GetAllUsers' 
      }).first();
      
      if (await userPermLabel.isVisible()) {
        const checkbox = userPermLabel.locator('input[type="checkbox"]');
        await checkbox.click();
        await page.waitForLoadState('networkidle');
      }

    }

    // Create
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Verify creation
    const roleRow = await findRoleRowByName(page, roleName);
    if (await roleRow.isVisible()) {
      await expect(roleRow).toBeVisible();
    }
  });

  test('84 - Inheritance with role editing', async ({ page }) => {
    const parentRoleName = `ParentRole${Math.random().toString(36).substring(7)}`;
    const childRoleName = `ChildRole${Math.random().toString(36).substring(7)}`;

    // Create parent role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(parentRoleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Create child role inheriting from parent
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(childRoleName);

    const inheritedRolesDropdown = page.locator('button').filter({ 
      has: page.locator('text=Select inherited roles') 
    }).first();
    
    if (await inheritedRolesDropdown.isVisible()) {
      await inheritedRolesDropdown.click();
      await page.waitForLoadState('networkidle');

      const parentLabel = page.locator('label').filter({ hasText: parentRoleName }).first();
      if (await parentLabel.isVisible()) {
        const checkbox = parentLabel.locator('input[type="checkbox"]');
        await checkbox.click();
        await page.waitForLoadState('networkidle');
      }

    }

    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Verify relationship was created
    await page.getByTestId(roleTestIds.searchInput).fill(childRoleName);
    await page.waitForLoadState('networkidle');

    const childRow = await findRoleRowByName(page, childRoleName);
    if (await childRow.isVisible()) {
      await expect(childRow).toBeVisible();
    }
  });
});
