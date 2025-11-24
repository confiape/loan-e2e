import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { faker } from '@faker-js/faker';

// Helper function to generate unique role names
function generateUniqueName(): string {
  const adjective = faker.word.adjective().charAt(0).toUpperCase() + faker.word.adjective().slice(1);
  const noun = faker.word.noun().charAt(0).toUpperCase() + faker.word.noun().slice(1);
  const digits = Math.floor(Math.random() * 90000) + 10000;
  return `TestRole_${adjective}${noun}${digits}`;
}

test.describe('Role Editing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('10 - Open edit role modal', async ({ page }) => {
    // Search for Admin role
    await page.getByTestId('roles-search-input').fill('Admin');
    await page.waitForLoadState('networkidle');

    // Find Admin row and click Edit
    const adminRow = page.locator('table tbody tr').filter({ hasText: /^Admin$/ });
    const editBtn = adminRow.locator('button:has-text("Edit")');
    await editBtn.click();

    // Wait for modal to open
    await page.waitForSelector('dialog', { state: 'visible' });

    // Verify modal title contains "Edit"
    const modalTitle = page.locator('dialog heading, dialog h3');
    await expect(modalTitle).toContainText(/Edit/i);

    // Verify role name is pre-filled
    const nameInput = page.getByTestId('roles-input-name');
    const currentValue = await nameInput.inputValue();
    expect(currentValue).toBe('Admin');
  });

  test('11 - Edit role name', async ({ page }) => {
    const originalName = generateUniqueName();
    const newName = generateUniqueName();

    // Create role first
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });
    await page.getByTestId('roles-input-name').fill(originalName);
    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    // Search for the role
    await page.getByTestId('roles-search-input').fill(originalName);
    await page.waitForLoadState('networkidle');

    // Click Edit
    const roleRow = page.locator('table tbody tr').filter({ hasText: originalName });
    const editBtn = roleRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForSelector('dialog', { state: 'visible' });

    // Change name
    const nameInput = page.getByTestId('roles-input-name');
    await nameInput.clear();
    await nameInput.fill(newName);

    // Click Update
    await page.getByTestId('roles-btn-update').click();
    await page.waitForLoadState('networkidle');

    // Verify old name doesn't exist
    await page.getByTestId('roles-search-input').fill(originalName);
    await page.waitForLoadState('networkidle');
    let roleRow2 = page.locator('table tbody tr').filter({ hasText: originalName });
    await expect(roleRow2).not.toBeVisible();

    // Verify new name exists
    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(newName);
    await page.waitForLoadState('networkidle');
    roleRow2 = page.locator('table tbody tr').filter({ hasText: newName });
    await expect(roleRow2).toBeVisible();
  });

  test('12 - Add inherited role to existing role', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create role without inherited roles
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });
    await page.getByTestId('roles-input-name').fill(roleName);
    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    // Search for the role
    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');

    // Click Edit
    const roleRow = page.locator('table tbody tr').filter({ hasText: roleName });
    const editBtn = roleRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForSelector('dialog', { state: 'visible' });

    // Select inherited role
    await page.getByTestId('roles-multiselect-rolesId').click();
    await page.getByRole('option', { name: /Admin/i }).click();
    await page.keyboard.press('Escape');

    // Click Update
    await page.getByTestId('roles-btn-update').click();
    await page.waitForLoadState('networkidle');

    // Verify role still exists
    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');
    const updatedRow = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(updatedRow).toBeVisible();
  });

  test('13 - Remove inherited role from existing role', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create role with inherited role
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });
    await page.getByTestId('roles-input-name').fill(roleName);
    await page.getByTestId('roles-multiselect-rolesId').click();
    await page.getByRole('option', { name: /Admin/i }).click();
    await page.keyboard.press('Escape');
    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    // Search for the role
    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');

    // Click Edit
    const roleRow = page.locator('table tbody tr').filter({ hasText: roleName });
    const editBtn = roleRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForSelector('dialog', { state: 'visible' });

    // Deselect inherited role
    await page.getByTestId('roles-multiselect-rolesId').click();
    const adminOption = page.getByRole('option', { name: /Admin/i });
    if (await adminOption.isVisible()) {
      await adminOption.click();
    }
    await page.keyboard.press('Escape');

    // Click Update
    await page.getByTestId('roles-btn-update').click();
    await page.waitForLoadState('networkidle');

    // Verify role still exists
    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');
    const updatedRow = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(updatedRow).toBeVisible();
  });

  test('14 - Add permissions to existing role', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create role without permissions
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });
    await page.getByTestId('roles-input-name').fill(roleName);
    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    // Search for the role
    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');

    // Click Edit
    const roleRow = page.locator('table tbody tr').filter({ hasText: roleName });
    const editBtn = roleRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForSelector('dialog', { state: 'visible' });

    // Select permissions
    await page.getByTestId('roles-multiselect-permissionsId').click();
    await page.getByRole('option', { name: /UserController_GetAllUsers/i }).click();
    await page.getByRole('option', { name: /UserController_SaveUser/i }).click();
    await page.keyboard.press('Escape');

    // Click Update
    await page.getByTestId('roles-btn-update').click();
    await page.waitForLoadState('networkidle');

    // Verify role still exists
    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');
    const updatedRow = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(updatedRow).toBeVisible();
  });

  test('15 - Remove permissions from existing role', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create role with permissions
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });
    await page.getByTestId('roles-input-name').fill(roleName);
    await page.getByTestId('roles-multiselect-permissionsId').click();
    await page.getByRole('option', { name: /UserController_GetAllUsers/i }).click();
    await page.getByRole('option', { name: /UserController_SaveUser/i }).click();
    await page.getByRole('option', { name: /UserController_DeleteUserAsync/i }).click();
    await page.keyboard.press('Escape');
    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    // Search for the role
    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');

    // Click Edit
    const roleRow = page.locator('table tbody tr').filter({ hasText: roleName });
    const editBtn = roleRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForSelector('dialog', { state: 'visible' });

    // Deselect one permission
    await page.getByTestId('roles-multiselect-permissionsId').click();
    const deleteOption = page.getByRole('option', { name: /UserController_DeleteUserAsync/i });
    if (await deleteOption.isVisible()) {
      await deleteOption.click();
    }
    await page.keyboard.press('Escape');

    // Click Update
    await page.getByTestId('roles-btn-update').click();
    await page.waitForLoadState('networkidle');

    // Verify role still exists
    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(roleName);
    await page.waitForLoadState('networkidle');
    const updatedRow = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(updatedRow).toBeVisible();
  });

  test('16 - Cancel edit operation', async ({ page }) => {
    const originalName = generateUniqueName();
    const newName = generateUniqueName();

    // Create role
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });
    await page.getByTestId('roles-input-name').fill(originalName);
    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    // Search and edit
    await page.getByTestId('roles-search-input').fill(originalName);
    await page.waitForLoadState('networkidle');

    const roleRow = page.locator('table tbody tr').filter({ hasText: originalName });
    const editBtn = roleRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForSelector('dialog', { state: 'visible' });

    // Change name but cancel
    const nameInput = page.getByTestId('roles-input-name');
    await nameInput.clear();
    await nameInput.fill(newName);

    // Click Cancel
    await page.getByTestId('roles-btn-cancel').click();
    await page.waitForSelector('dialog', { state: 'hidden' });

    // Verify original name still exists
    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(originalName);
    await page.waitForLoadState('networkidle');
    let searchRow = page.locator('table tbody tr').filter({ hasText: originalName });
    await expect(searchRow).toBeVisible();

    // Verify new name doesn't exist
    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(newName);
    await page.waitForLoadState('networkidle');
    searchRow = page.locator('table tbody tr').filter({ hasText: newName });
    await expect(searchRow).not.toBeVisible();
  });

  test('17 - Verify data persistence after page refresh', async ({ page }) => {
    const originalName = generateUniqueName();
    const newName = generateUniqueName();

    // Create role
    await page.getByTestId('roles-btn-new').click();
    await page.waitForSelector('dialog', { state: 'visible' });
    await page.getByTestId('roles-input-name').fill(originalName);
    await page.getByTestId('roles-btn-create').click();
    await page.waitForLoadState('networkidle');

    // Search and edit
    await page.getByTestId('roles-search-input').fill(originalName);
    await page.waitForLoadState('networkidle');

    const roleRow = page.locator('table tbody tr').filter({ hasText: originalName });
    const editBtn = roleRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForSelector('dialog', { state: 'visible' });

    // Change name and save
    const nameInput = page.getByTestId('roles-input-name');
    await nameInput.clear();
    await nameInput.fill(newName);

    await page.getByTestId('roles-btn-update').click();
    await page.waitForLoadState('networkidle');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify new name persists
    await page.getByTestId('roles-search-input').fill(newName);
    await page.waitForLoadState('networkidle');
    const persistRow = page.locator('table tbody tr').filter({ hasText: newName });
    await expect(persistRow).toBeVisible();
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
      await page.getByTestId('roles-btn-new').click();
      await page.waitForSelector('dialog', { state: 'visible' });
      await page.getByTestId('roles-input-name').fill(roleName);
      await page.getByTestId('roles-btn-create').click();
      await page.waitForLoadState('networkidle');
    }

    // Edit role 1
    await page.getByTestId('roles-search-input').fill(role1);
    await page.waitForLoadState('networkidle');
    let roleRow = page.locator('table tbody tr').filter({ hasText: role1 });
    let editBtn = roleRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForSelector('dialog', { state: 'visible' });
    let nameInput = page.getByTestId('roles-input-name');
    await nameInput.clear();
    await nameInput.fill(role1Updated);
    await page.getByTestId('roles-btn-update').click();
    await page.waitForLoadState('networkidle');

    // Edit role 2
    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(role2);
    await page.waitForLoadState('networkidle');
    roleRow = page.locator('table tbody tr').filter({ hasText: role2 });
    editBtn = roleRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForSelector('dialog', { state: 'visible' });
    nameInput = page.getByTestId('roles-input-name');
    await nameInput.clear();
    await nameInput.fill(role2Updated);
    await page.getByTestId('roles-btn-update').click();
    await page.waitForLoadState('networkidle');

    // Edit role 3
    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(role3);
    await page.waitForLoadState('networkidle');
    roleRow = page.locator('table tbody tr').filter({ hasText: role3 });
    editBtn = roleRow.locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForSelector('dialog', { state: 'visible' });
    nameInput = page.getByTestId('roles-input-name');
    await nameInput.clear();
    await nameInput.fill(role3Updated);
    await page.getByTestId('roles-btn-update').click();
    await page.waitForLoadState('networkidle');

    // Verify all updated names exist
    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(role1Updated);
    await page.waitForLoadState('networkidle');
    let updatedRow = page.locator('table tbody tr').filter({ hasText: role1Updated });
    await expect(updatedRow).toBeVisible();

    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(role2Updated);
    await page.waitForLoadState('networkidle');
    updatedRow = page.locator('table tbody tr').filter({ hasText: role2Updated });
    await expect(updatedRow).toBeVisible();

    await page.getByTestId('roles-search-input').clear();
    await page.getByTestId('roles-search-input').fill(role3Updated);
    await page.waitForLoadState('networkidle');
    updatedRow = page.locator('table tbody tr').filter({ hasText: role3Updated });
    await expect(updatedRow).toBeVisible();
  });
});
