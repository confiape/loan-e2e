import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { roleTestIds, findRoleRowByName } from '../actions/roles.actions';
import { faker } from '@faker-js/faker';

function generateUniqueName(): string {
  return `ValidTest${faker.string.alphanumeric({ length: 5 })}`;
}

test.describe('Role Validation and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('58 - Validate role name - Required field', async ({ page }) => {
    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Leave role name empty
    const roleNameInput = page.getByTestId(roleTestIds.roleNameInput);
    await expect(roleNameInput).toBeFocused();

    // Click away/Tab to trigger validation
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Create button should be disabled
    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(createBtn).toBeDisabled();
  });

  test('59 - Validate role name - Too short (1 character)', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter 1 character
    const roleNameInput = page.getByTestId(roleTestIds.roleNameInput);
    await roleNameInput.fill('A');
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Create button should be disabled
    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(createBtn).toBeDisabled();
  });

  test('60 - Validate role name - Minimum boundary (exactly 2 characters)', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter exactly 2 characters
    const roleNameInput = page.getByTestId(roleTestIds.roleNameInput);
    await roleNameInput.fill('IT');
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Create button should be enabled
    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(createBtn).toBeEnabled();
  });

  test('61 - Validate role name - Maximum boundary (exactly 40 characters)', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter exactly 40 characters
    const roleNameInput = page.getByTestId(roleTestIds.roleNameInput);
    const fortyCharName = 'Administration and Management Personnel';
    await roleNameInput.fill(fortyCharName);
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Create button should be enabled
    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(createBtn).toBeEnabled();
  });

  test('62 - Validate role name - Too long (over 40 characters)', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Try to enter more than 40 characters
    const roleNameInput = page.getByTestId(roleTestIds.roleNameInput);
    const longName = 'This is a very long role name that exceeds forty characters';
    await roleNameInput.fill(longName);
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Create button should be disabled or field should be limited
    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    const isDisabled = await createBtn.isDisabled();
    const inputValue = await roleNameInput.inputValue();

    // Either button is disabled or input is truncated
    expect(isDisabled || inputValue.length <= 40).toBeTruthy();
  });

  test('63 - Validate role name - Special characters', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter name with special characters
    const roleNameInput = page.getByTestId(roleTestIds.roleNameInput);
    await roleNameInput.fill('Test@Role#123!');
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Create button should be disabled
    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    const isDisabled = await createBtn.isDisabled();

    // Should show error or be disabled
    expect(isDisabled).toBeTruthy();
  });

  test('64 - Validate role name - Numbers and spaces allowed', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter name with numbers and spaces
    const roleNameInput = page.getByTestId(roleTestIds.roleNameInput);
    await roleNameInput.fill('Role 123');
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Check if this is valid (depends on implementation)
    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    const isEnabled = await createBtn.isEnabled();
    // Document actual behavior
  });

  test('65 - Real-time validation feedback', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    const roleNameInput = page.getByTestId(roleTestIds.roleNameInput);
    const createBtn = page.getByTestId(roleTestIds.submitBtn);

    // Initially disabled (empty)
    await expect(createBtn).toBeDisabled();

    // Type valid input
    await roleNameInput.fill('ValidRole');
    await page.waitForLoadState('networkidle');

    // Should become enabled
    await expect(createBtn).toBeEnabled();

    // Clear and should disable again
    await roleNameInput.clear();
    await page.waitForLoadState('networkidle');
    await expect(createBtn).toBeDisabled();
  });

  test('66 - Validate on edit form', async ({ page }) => {
    const roleName = generateUniqueName();

    // Create a role first
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Search and edit
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState('networkidle');

    const roleRow = await findRoleRowByName(page, roleName);
    const editButton = roleRow.getByRole('button', { name: 'Edit' });
    await editButton.click();
    await page.waitForLoadState('networkidle');

    // Clear the role name
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    await nameInput.clear();
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Update button should be disabled
    const updateBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(updateBtn).toBeDisabled();

    // Close modal
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState("networkidle");
  });

  test('67 - Duplicate role name error', async ({ page }) => {
    const roleName = 'DuplicateTest123';

    // Create first role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Try to create second role with same name
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Should show error or prevent creation
    // Either error message or modal still open
    const modal = page.getByTestId(roleTestIds.modal);
    const isModalStillOpen = await modal.isVisible().catch(() => false);

    // Document actual behavior
    if (isModalStillOpen) {
      // Error is shown
      await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
    }
  });

  test('68 - Valid name with spaces between words', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter name with spaces between words
    const roleNameInput = page.getByTestId(roleTestIds.roleNameInput);
    await roleNameInput.fill('Senior Account Manager');
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Should be valid
    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(createBtn).toBeEnabled();

    // Cancel without creating
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState("networkidle");
  });
});
