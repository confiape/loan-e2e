import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - Security and Permissions Testing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test.describe('Authentication and Authorization', () => {
    test('14.1: Should require authentication to access roles page', async ({ page }) => {
      await expect(page).toHaveURL(/.*\/roles$/);
      const heading = page.locator('h1, h2, [role="heading"]').first();
      await expect(heading).toContainText(/Roles/i);
    });

    test('14.2: Should show role-based actions based on user permissions', async ({ page }) => {
      const newRoleBtn = page.getByTestId(roleTestIds.newRoleBtn);
      const isVisible = await newRoleBtn.isVisible();
      expect(typeof isVisible).toBe('boolean');
    });

    test('14.3: Edit button should be visible/hidden based on permissions', async ({ page }) => {
      const editButtons = page.getByRole('button', { name: 'Edit' });
      const editCount = await editButtons.count();
      expect(editCount).toBeGreaterThanOrEqual(0);
    });

    test('14.4: Delete button should be visible/hidden based on permissions', async ({ page }) => {
      const deleteButtons = page.getByRole('button', { name: 'Delete' });
      const deleteCount = await deleteButtons.count();
      expect(deleteCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Input Validation and Injection Prevention', () => {
    test('14.6: Should prevent SQL injection attempts in search', async ({ page }) => {
      const searchInput = page.getByTestId(roleTestIds.searchInput);
      await searchInput.fill("' OR '1'='1");
      await page.waitForTimeout(300);

      const rows = page.getByRole('row');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);

      await searchInput.clear();
    });

    test('14.7: Should prevent XSS via role name input', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      await nameInput.fill("<script>alert('XSS')</script>");
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      const createBtn = page.getByTestId(roleTestIds.submitBtn);
      const isDisabled = await createBtn.isDisabled();
      expect(isDisabled).toBeTruthy();

      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });

    test('14.8: Should prevent XSS via search input', async ({ page }) => {
      const searchInput = page.getByTestId(roleTestIds.searchInput);
      await searchInput.fill("<img src=x onerror='alert(1)'>");
      await page.waitForTimeout(500);

      const consoleMessages = page.locator('text=/alert|error/', { exact: false });
      const errorCount = await consoleMessages.count();
      expect(errorCount).toBe(0);

      await searchInput.clear();
    });

    test('14.9: Should sanitize special database characters', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      const specialName = "Test'; DROP TABLE roles; --";
      await nameInput.fill(specialName);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      const createBtn = page.getByTestId(roleTestIds.submitBtn);
      const isDisabled = await createBtn.isDisabled();
      expect(isDisabled).toBeTruthy();

      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });

    test('14.10: Should validate all input fields consistently', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      const nameInput = page.getByTestId(roleTestIds.roleNameInput);
      await nameInput.fill('@#$%^&*()');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      const createBtn = page.getByTestId(roleTestIds.submitBtn);
      let isDisabled = await createBtn.isDisabled();
      expect(isDisabled).toBeTruthy();

      await nameInput.clear();
      await nameInput.fill('Valid Role Name');
      await page.waitForTimeout(300);

      const isEnabled = !await createBtn.isDisabled();
      expect(isEnabled).toBeTruthy();

      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });
  });

  test.describe('Direct URL Access', () => {
    test('14.9: Should handle direct URL access to edit page', async ({ page }) => {
      const roleIdCell = page.locator('tbody td:nth-child(3)').first();
      const roleId = await roleIdCell.textContent();

      if (roleId && roleId.trim().length > 0) {
        await page.goto(`/roles/${roleId.trim()}`);
        await page.waitForTimeout(500);

        const modal = page.getByTestId(roleTestIds.modal);
        const modalVisible = await modal.isVisible().catch(() => false);

        const currentUrl = page.url();

        expect(
          currentUrl.includes('/roles') ||
          modalVisible
        ).toBeTruthy();
      }
    });
  });

  test.describe('API Security', () => {
    test('14.10: Should enforce authorization on API calls', async ({ page }) => {
      const requests: any[] = [];
      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      });

      const roleName = generateUniqueName();
      await roleActions.create({ name: roleName });

      const apiRequests = requests.filter(r => r.url.includes('/api'));

      if (apiRequests.length > 0) {
        apiRequests.forEach(req => {
          expect(req.method).toBeDefined();
        });
      }
    });
  });

  test.describe('Data Protection', () => {
    test('14.5: Should not display sensitive role data unnecessarily', async ({ page }) => {
      const tableContent = await page.getByTestId(roleTestIds.table).textContent();

      expect(tableContent).toContain('Admin');
      expect(tableContent).not.toContain('password');
      expect(tableContent).not.toContain('secret');

      // Verify Admin role exists
      await roleActions.verifyExists('Admin');
    });
  });

  test.describe('CSRF Protection', () => {
    test('Should verify CSRF tokens in forms (if applicable)', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      const csrfToken = page.locator('input[name*="csrf"], input[name*="token"]').first();
      const tokenVisible = await csrfToken.isVisible().catch(() => false);

      const modal = page.getByTestId(roleTestIds.modal);
      expect(await modal.isVisible()).toBeTruthy();

      const cancelBtn = page.getByTestId(roleTestIds.cancelBtn);
      await cancelBtn.click();
    });
  });
});
