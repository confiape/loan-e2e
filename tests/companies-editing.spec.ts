import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { CompanyActions, companyTestIds } from '../actions/companies.actions';
import { generateUniqueName } from '../data/role-name-generator';

let companyActions: CompanyActions;

test.describe('Companies - Editing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    companyActions = new CompanyActions(page);
    await companyActions.navigateTo();
  });

  test.describe('Edit Modal Structure', () => {
    test('3.1: Should open Edit Company modal with existing data', async ({ page }) => {
      // Create a test company first
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      // Open edit modal
      await companyActions.openEditByName(companyName);

      // Verify modal structure
      await expect(page.getByRole('heading', { name: /Edit Company/i })).toBeVisible();
      await expect(page.getByTestId(companyTestIds.companyNameInput)).toBeVisible();

      // Verify field is pre-filled
      const inputValue = await page.getByTestId(companyTestIds.companyNameInput).inputValue();
      expect(inputValue).toBe(companyName);

      // Verify buttons
      await expect(page.getByTestId(companyTestIds.submitBtn)).toBeVisible();
      await expect(page.getByTestId(companyTestIds.cancelBtn)).toBeVisible();
    });
  });

  test.describe('Valid Company Updates', () => {
    test('3.2: Should update company name successfully', async ({ page }) => {
      const originalName = generateUniqueName();
      const updatedName = generateUniqueName() + 'Updated';

      // Create company
      await companyActions.create({ name: originalName });
      await companyActions.verifyExists(originalName);

      // Edit company
      await companyActions.edit(originalName, { name: updatedName });

      // Verify old name doesn't exist
      await companyActions.clearSearch();
      await companyActions.search(originalName);
      await expect(page.locator('text=/No data available|no companies/i')).toBeVisible();

      // Verify new name exists
      await companyActions.clearSearch();
      await companyActions.verifyExists(updatedName);
    });

    test('3.3: Should update company to minimum valid length', async ({ page }) => {
      const originalName = generateUniqueName();
      const minName = 'XY';

      await companyActions.create({ name: originalName });
      await companyActions.edit(originalName, { name: minName });
      await companyActions.verifyExists(minName);
    });

    test('3.4: Should update company to maximum valid length', async ({ page }) => {
      const originalName = generateUniqueName();
      const maxLengthName = 'Global Enterprise Management Solutions C';
      expect(maxLengthName.length).toBe(40);

      await companyActions.create({ name: originalName });
      await companyActions.edit(originalName, { name: maxLengthName });
      await companyActions.verifyExists(maxLengthName);
    });
  });

  test.describe('Update Button State', () => {
    test('3.5: Should disable Update button when name is cleared', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      await companyActions.openEditByName(companyName);

      // Clear the input
      await page.getByTestId(companyTestIds.companyNameInput).clear();
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      // Verify button is disabled
      const updateBtn = page.getByTestId(companyTestIds.submitBtn);
      await expect(updateBtn).toBeDisabled();
    });

    test('3.6: Should disable Update button with invalid characters', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      await companyActions.openEditByName(companyName);

      // Change to invalid name
      await page.getByTestId(companyTestIds.companyNameInput).fill('Company@123');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      // Verify button is disabled or error is shown
      const updateBtn = page.getByTestId(companyTestIds.submitBtn);
      const isDisabled = await updateBtn.isDisabled();
      expect(isDisabled).toBeTruthy();
    });

    test('3.7: Should disable Update button with name too short', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      await companyActions.openEditByName(companyName);

      // Change to too short name
      await page.getByTestId(companyTestIds.companyNameInput).fill('A');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      // Verify button is disabled
      const updateBtn = page.getByTestId(companyTestIds.submitBtn);
      await expect(updateBtn).toBeDisabled();
    });
  });

  test.describe('Edit Form Interactions', () => {
    test('3.8: Should cancel editing without saving changes', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      await companyActions.openEditByName(companyName);

      // Change name but don't save
      const newName = companyName + 'Modified';
      await page.getByTestId(companyTestIds.companyNameInput).fill(newName);

      // Cancel
      await page.getByTestId(companyTestIds.cancelBtn).click();
      await page.waitForTimeout(300);

      // Verify modal is closed
      await expect(page.getByTestId(companyTestIds.modal)).not.toBeVisible();

      // Verify original name still exists
      await companyActions.verifyExists(companyName);

      // Verify new name doesn't exist
      await companyActions.search(newName);
      await expect(page.locator('text=/No data available|no companies/i')).toBeVisible();
    });

    test('3.9: Should navigate to edit page with correct URL', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      // Find the company and get its ID from the URL or row
      const row = await companyActions.findRowByName(companyName);

      // Get the edit button
      const editBtn = row.getByRole('button', { name: 'Edit' });
      await editBtn.click();
      await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();

      // Verify URL contains /companies/
      const url = page.url();
      expect(url).toContain('/companies');
    });

    test('3.10: Should preserve data when navigating back from edit', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      await companyActions.openEditByName(companyName);

      // Click browser back button
      await page.goBack();
      await page.waitForTimeout(500);

      // Should return to companies list
      const url = page.url();
      expect(url).toContain('/companies');

      // Company should still exist
      await companyActions.verifyExists(companyName);
    });
  });

  test.describe('Validation Consistency', () => {
    test('3.11: Should apply same validation rules as create form', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      await companyActions.openEditByName(companyName);

      // Test empty
      await page.getByTestId(companyTestIds.companyNameInput).fill('');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      let updateBtn = page.getByTestId(companyTestIds.submitBtn);
      await expect(updateBtn).toBeDisabled();

      // Test too short
      await page.getByTestId(companyTestIds.companyNameInput).fill('A');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      updateBtn = page.getByTestId(companyTestIds.submitBtn);
      await expect(updateBtn).toBeDisabled();

      // Test too long
      await page.getByTestId(companyTestIds.companyNameInput).fill('A'.repeat(41));
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      updateBtn = page.getByTestId(companyTestIds.submitBtn);
      const isDisabled = await updateBtn.isDisabled();
      expect(isDisabled).toBeTruthy();

      // Test special characters
      await page.getByTestId(companyTestIds.companyNameInput).fill('Test@Company');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      updateBtn = page.getByTestId(companyTestIds.submitBtn);
      const hasSpecialCharError = await updateBtn.isDisabled();
      expect(hasSpecialCharError).toBeTruthy();
    });
  });
});
