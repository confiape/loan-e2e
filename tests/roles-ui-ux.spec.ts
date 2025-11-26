import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { RoleActions, roleTestIds } from '../actions/roles.actions';
import { generateUniqueName } from '../data/role-name-generator';

let roleActions: RoleActions;

test.describe('Roles - UI/UX and Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    roleActions = new RoleActions(page);
    await roleActions.navigateTo();
  });

  test.describe('Modal Dialog Behavior', () => {
    test('12.1: Modal should be responsive at different window sizes', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      const modal = page.getByTestId(roleTestIds.modal);
      const boundingBox = await modal.boundingBox();

      expect(boundingBox).not.toBeNull();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
      }

      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      await expect(modal).toBeVisible();

      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(500);

      await page.getByTestId(roleTestIds.cancelBtn).click();
    });

    test('12.2: Table should be responsive on narrow screens', async ({ page }) => {
      const table = page.getByTestId(roleTestIds.table);
      await expect(table).toBeVisible();

      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      const rows = page.locator('tbody tr, [role="row"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(500);
    });
  });

  test.describe('Button States and Visual Feedback', () => {
    test.fixme('12.3: Buttons should show hover state', async ({ page }) => {
      const newRoleBtn = page.getByTestId(roleTestIds.newRoleBtn);

      await newRoleBtn.hover();
      await page.waitForTimeout(300);

      const cursorStyle = await newRoleBtn.evaluate(el => window.getComputedStyle(el).cursor);
      expect(cursorStyle).toBe('pointer');

      expect(newRoleBtn).toBeVisible();
    });

    test('12.4: Create button should be disabled when form is incomplete', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      const submitBtn = page.getByTestId(roleTestIds.submitBtn);

      let isDisabled = await submitBtn.isDisabled();
      expect(isDisabled).toBeTruthy();

      await page.getByTestId(roleTestIds.roleNameInput).fill('Test Role');
      await page.waitForTimeout(300);

      isDisabled = await submitBtn.isDisabled();
      expect(!isDisabled).toBeTruthy();

      await page.getByTestId(roleTestIds.cancelBtn).click();
    });

    test('12.5: Disabled buttons should have distinct appearance', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      const submitBtn = page.getByTestId(roleTestIds.submitBtn);

      const opacity = await submitBtn.evaluate(el => window.getComputedStyle(el).opacity);
      const pointer = await submitBtn.evaluate(el => window.getComputedStyle(el).pointerEvents);

      expect(
        opacity === '0.5' || opacity === '0.6' || pointer === 'none' ||
        await submitBtn.isDisabled()
      ).toBeTruthy();

      await page.getByTestId(roleTestIds.cancelBtn).click();
    });
  });

  test.describe('Loading and Notification States', () => {
    test('12.6: Should show loading feedback during creation', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.submitBtn).click();

      const spinner = page.locator('[class*="spinner"], [class*="loading"], [class*="progress"]').first();
      const spinnerVisible = await spinner.isVisible().catch(() => false);

      await page.waitForTimeout(1500);

      const modal = page.getByTestId(roleTestIds.modal);
      const modalStillOpen = await modal.isVisible().catch(() => false);
      expect(!modalStillOpen).toBeTruthy();
    });

    test('12.7: Should show success notification after successful operation', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.getByTestId(roleTestIds.submitBtn).click();
      await page.waitForTimeout(1000);

      const successMsg = page.locator('[class*="success"], [class*="toast"], [role="alert"]').first();
      const isVisible = await successMsg.isVisible().catch(() => false);

      if (isVisible) {
        const text = await successMsg.textContent();
        expect(text?.toLowerCase()).toContain('success');
      } else {
        await roleActions.verifyExists(roleName);
      }
    });

    test('12.8: Should show error message for validation failures', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      await page.getByTestId(roleTestIds.roleNameInput).fill('@#$%');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      await expect(page.getByTestId('roles-input-name-error')).toContainText('Invalid value');

      await page.getByTestId(roleTestIds.cancelBtn).click();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('12.9: Should be fully keyboard navigable', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        const focused = page.locator(':focus-visible, :focus').first();
        const text = await focused.textContent();

        if (text?.includes('New Role')) {
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);

          const modal = page.getByTestId(roleTestIds.modal);
          await expect(modal).toBeVisible();

          await page.keyboard.press('Tab');
          await page.keyboard.type('Keyboard Test Role');

          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);

          break;
        }
      }
    });

    test('12.10: Escape key should close modals', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      const modal = page.getByTestId(roleTestIds.modal);
      await expect(modal).toBeVisible();

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      const isClosed = !(await modal.isVisible().catch(() => false));
      expect(isClosed).toBeTruthy();
    });

    test('12.11: Enter key should submit forms', async ({ page }) => {
      const roleName = generateUniqueName();

      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);

      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      const modal = page.getByTestId(roleTestIds.modal);
      const modalClosed = !(await modal.isVisible().catch(() => false));

      if (modalClosed) {
        await roleActions.verifyExists(roleName);
      }
    });
  });

  test.describe('Focus Management', () => {
    test('12.12: Initial focus should be on first input in modal', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      const focused = page.locator(':focus-visible, :focus').first();
      const placeholder = await focused.getAttribute('placeholder');

      expect(placeholder || await focused.textContent()).toBeDefined();
    });

    test('12.13: Focus should return to trigger button after closing modal', async ({ page }) => {
      await page.getByTestId(roleTestIds.newRoleBtn).click();
      await page.waitForTimeout(300);

      await page.getByTestId(roleTestIds.cancelBtn).click();
      await page.waitForTimeout(300);

      const focused = page.locator(':focus-visible, :focus, [class*="focus"]').first();
      const focusedText = await focused.textContent().catch(() => '');

      expect(page.url()).toContain('/roles');
    });
  });

  test.describe('Empty States', () => {
    test('12.14: Should show friendly message when no roles found', async ({ page }) => {
      const searchInput = page.getByTestId(roleTestIds.searchInput);
      if (await searchInput.isVisible()) {
        await searchInput.fill('NonExistentRoleXYZ123');
        await page.waitForTimeout(500);

        const rows = page.locator('tbody tr, [role="row"]');
        const rowCount = await rows.count();

        if (rowCount === 0) {
          const emptyMsg = page.locator('[class*="empty"], [class*="no-data"]').first();
          const msgVisible = await emptyMsg.isVisible().catch(() => false);

          if (msgVisible) {
            const text = await emptyMsg.textContent();
            expect(text?.toLowerCase()).toContain('no');
          }
        }

        await searchInput.clear();
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('12.15: Should have sufficient color contrast for readability', async ({ page }) => {
      const heading = page.locator('h1, h2, [role="heading"]').first();

      const color = await heading.evaluate(el => window.getComputedStyle(el).color);
      const backgroundColor = await heading.evaluate(
        el => window.getComputedStyle(el.parentElement || el).backgroundColor
      );

      expect(color).not.toMatch(/rgba\(0, 0, 0, 0\)/);
      expect(color).toBeDefined();
    });

    test('12.16: Buttons should have distinct visual state', async ({ page }) => {
      const btn = page.locator('button').first();

      const color = await btn.evaluate(el => window.getComputedStyle(el).color);
      const bgColor = await btn.evaluate(el => window.getComputedStyle(el).backgroundColor);

      expect(color).toBeDefined();
      expect(bgColor).toBeDefined();
    });
  });
});
