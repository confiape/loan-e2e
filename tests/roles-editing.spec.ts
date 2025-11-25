import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { faker } from '@faker-js/faker';
import { createRole, editRole, findRoleRowByName, openEditRolesByName, roleTestIds, verifyInheritedRoles, verifyNotInheritedRoles, verifyNotPermissions, verifyPermissions, verifyRoleExistsInTable, verifyRoleNotInTable } from '../actions/roles.actions';

// Helper function to generate unique role names
function generateUniqueName(): string {
  return `RoleTest${faker.string.alphanumeric({
    length: 5,
  })}`;
}

test.describe('Role Editing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    
  });

  test('10 - Open edit role modal', async ({ page }) => {

    await openEditRolesByName(page, 'Admin');
   
    // Wait for modal to open
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Verify modal title contains "Edit"
    await expect(page.getByTestId(roleTestIds.modal).getByRole('heading')).toContainText('Edit Role');

    // Verify role name is pre-filled
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    const currentValue = await nameInput.inputValue();
    expect(currentValue).toBe('Admin');
  });

  test('11 - Edit role name', async ({ page }) => {
    const originalName = generateUniqueName();
    const newName = generateUniqueName();

    // Create role    await page.getByTestId('roles-btn-new').click();
    await createRole(page, { name: originalName });
    
    // Search and edit
    await editRole(page, originalName, { name: newName });

    // Verify old name doesn't exist
    await expect(await findRoleRowByName(page, originalName)).not.toBeVisible();

    // Verify new name exists
    await expect(await findRoleRowByName(page, newName)).toBeVisible();
  });

  test('12 - Add inherited role to existing role', async ({ page }) => {

    const name = generateUniqueName();

    // Create role    await page.getByTestId('roles-btn-new').click();
    await createRole(page, { name: name });
    
    // Search and edit
    await editRole(page, name, { inheritedRoles: ['Admin']});

    // Verify role still exists
    await expect(await findRoleRowByName(page, name)).toBeVisible();
    await verifyInheritedRoles(page, name, ['Admin']);

  });

  test('13 - Remove inherited role from existing role', async ({ page }) => {
    const name = generateUniqueName();

    // Create role
    await createRole(page, { name: name ,inheritedRoles: ['Admin'] });
    
    // Search and edit 
    await editRole(page, name, { inheritedRoles: ['Admin']}); // re-select to un check

    // Verify role still exists
    await expect(await findRoleRowByName(page, name)).toBeVisible();
    await verifyNotInheritedRoles(page, name, ['Admin']);
  });

  test('14 - Add permissions to existing role', async ({ page }) => {
    const name = generateUniqueName();

    // Create role
    await createRole(page, { name: name ,inheritedRoles: ['Admin'] });
    
    // Search and edit 
    await editRole(page, name, {permissions: ['UserController_GetAllUsers', 'UserController_SaveUser']}); // re-select to un check

    // Verify role still exists
    await expect(await findRoleRowByName(page, name)).toBeVisible();
    await verifyPermissions(page, name, ['UserController_GetAllUsers','UserController_SaveUser']);

  });

  test('15 - Remove permissions from existing role', async ({ page }) => {
        const name = generateUniqueName();

    // Create role
    await createRole(page, { name: name ,permissions: ['UserController_DeleteUserAsync'] });
    
    // Search and edit 
    await editRole(page, name, {permissions: ['UserController_DeleteUserAsync']}); // re-select to un check

    // Verify role still exists
    await expect(await findRoleRowByName(page, name)).toBeVisible();
    await verifyNotPermissions(page, name, ['UserController_DeleteUserAsync']);
  });

  test('16 - Cancel edit operation', async ({ page }) => {
    const originalName = generateUniqueName();
    const newName = generateUniqueName();

     // Create role
    await createRole(page, { name: originalName ,permissions: ['UserController_DeleteUserAsync'] });
    await openEditRolesByName(page, originalName);


    // Change name but cancel
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    await nameInput.fill(newName);

    // Click Cancel
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await expect(page.getByTestId(roleTestIds.modal)).not.toBeVisible();

    // Verify original name still exists
    await verifyRoleExistsInTable(page, originalName);

    // Verify new name doesn't exist
    await verifyRoleNotInTable(page, newName);
  });

  test('17 - Verify data persistence after page refresh', async ({ page }) => {
    const originalName = generateUniqueName();
    const newName = generateUniqueName();

    // Create role
    await createRole(page, { name: originalName });

    // Search and edit
    await editRole(page, originalName, { name: newName }); 

    

    // Reload page
    await page.reload();
    

    // Verify new name persists
    await verifyRoleExistsInTable(page, newName);
  });

  test('18 - Edit multiple roles in sequence', async ({ page }) => {
    const role1 = generateUniqueName();
    const role2 = generateUniqueName();
    const role3 = generateUniqueName();

    const role1Updated = generateUniqueName();
    const role2Updated = generateUniqueName();
    const role3Updated = generateUniqueName();

    // Create three roles
    for (const roleName of [role1, role2, role3]) {
      await createRole(page, { name: roleName }); 
    }

    // Edit role 1
    await editRole(page, role1, { name: role1Updated });
    

    // Edit role 2
    await editRole(page, role2, { name: role2Updated });
    

    // Edit role 3
    await editRole(page, role3, { name: role3Updated });
    

    // Verify all updated names exist
    for (const updatedName of [role1Updated, role2Updated, role3Updated]) {
      await verifyRoleExistsInTable(page, updatedName);
    }
  });
});
