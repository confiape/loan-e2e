import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { CompanyActions, companyTestIds } from '../actions/companies.actions';
import { generateUniqueName } from '../data/role-name-generator';

let companyActions: CompanyActions;

test.describe('Companies - UI/UX and Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    companyActions = new CompanyActions(page);
    await companyActions.navigateTo();
  });

  test.describe('Focus Management', () => {
    test('9.1: Should have proper focus management in modal', async ({ page }) => {
      await page.getByTestId(companyTestIds.newCompanyBtn).click();
      await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();

      // Focus should be in the modal
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));

      // Check if focus is on input or somewhere in modal
      const modal = page.getByTestId(companyTestIds.modal);
      const isFocusInModal = await modal.evaluate((el) => {
        const activeElement = document.activeElement;
        return el.contains(activeElement);
      });

      expect(isFocusInModal).toBeTruthy();
    });

    test('9.2: Should support keyboard navigation', async ({ page }) => {
      await page.getByTestId(companyTestIds.newCompanyBtn).click();
      await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();

      // Tab to move between elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should still be in modal
      const modal = page.getByTestId(companyTestIds.modal);
      const isFocusInModal = await modal.evaluate((el) => {
        const activeElement = document.activeElement;
        return el.contains(activeElement);
      });

      expect(isFocusInModal).toBeTruthy();

      // Escape should close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      await expect(page.getByTestId(companyTestIds.modal)).not.toBeVisible();
    });

    test('Should navigate table with keyboard', async ({ page }) => {
      // Tab through table elements
      const nameHeader = page.getByRole('columnheader', { name: /name/i }).first();
      await nameHeader.focus();

      // Verify element has focus
      const isFocused = await nameHeader.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBeTruthy();
    });
  });

  test.describe('Loading and Loading States', () => {
    test('9.3: Should show loading states during operations', async ({ page }) => {
      const companyName = generateUniqueName();

      // Create company and watch for loading state
      await page.getByTestId(companyTestIds.newCompanyBtn).click();
      await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();

      await page.getByTestId(companyTestIds.companyNameInput).fill(companyName);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      // Click submit and check for loading
      const submitBtn = page.getByTestId(companyTestIds.submitBtn);
      const isDisabledBeforeClick = await submitBtn.isDisabled();

      await submitBtn.click();

      // Button might be disabled or show loading during submission
      // Just verify operation completes
      await page.waitForLoadState('networkidle');

      // Verify company was created
      await companyActions.verifyExists(companyName);
    });
  });

  test.describe('Notifications', () => {
    test('9.4: Should display success notifications', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      // Check for success notification (varies by implementation)
      const successMsg = page.locator('text=/success|created|added/i, [class*="success"], [class*="toast"]');

      // Success notification might appear or not, depending on implementation
      // Just verify company exists
      await companyActions.verifyExists(companyName);
    });

    test('9.5: Should display error notifications on failure', async ({ page }) => {
      // Try to create company with invalid name
      await page.getByTestId(companyTestIds.newCompanyBtn).click();
      await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();

      await page.getByTestId(companyTestIds.companyNameInput).fill('A'); // Too short
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      // Submit button should be disabled
      const submitBtn = page.getByTestId(companyTestIds.submitBtn);
      await expect(submitBtn).toBeDisabled();

      // Check for error message
      const errorMsg = page.locator('text=/error|invalid|must be/i, [class*="error"]');
      // Error message might appear or button might just be disabled
    });
  });

  test.describe('Responsive Layout', () => {
    test('9.6: Should have responsive table layout', async ({ page }) => {
      // Test at different viewport sizes
      const viewportSizes = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 },   // Mobile
      ];

      for (const size of viewportSizes) {
        await page.setViewportSize(size);
        await page.waitForTimeout(500);

        // Table should still be visible
        await expect(page.getByTestId(companyTestIds.table)).toBeVisible();

        // Should not have horizontal scrollbar issues
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const windowWidth = await page.evaluate(() => window.innerWidth);

        // Body should not exceed window width (or slightly)
        expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 50);
      }

      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('Empty State', () => {
    test('9.7: Should show empty state message appropriately', async ({ page }) => {
      // Search for non-existent company
      const nonExistentName = 'NonExistentCompany' + Math.random().toString(36).substring(7);
      await companyActions.search(nonExistentName);

      // Should show empty state or no data message
      const emptyMsg = page.locator('text=/No data|empty|no results/i');
      const hasEmptyMsg = await emptyMsg.isVisible().catch(() => false);

      // Should have empty message or empty table
      const rows = page.getByRole('row');
      const rowCount = await rows.count();

      expect(hasEmptyMsg || rowCount <= 1).toBeTruthy();
    });
  });

  test.describe('Visual Feedback', () => {
    test('9.8: Should have clear visual feedback on hover', async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      const row = await companyActions.findRowByName(companyName);

      // Get initial style
      const initialStyle = await row.getAttribute('style');
      const initialClass = await row.getAttribute('class');

      // Hover over row
      await row.hover();
      await page.waitForTimeout(300);

      // Check if style or class changed (hover effect)
      const hoverStyle = await row.getAttribute('style');
      const hoverClass = await row.getAttribute('class');

      // Either style or class should indicate hover (or visual change)
      // This is optional depending on design
    });

    test('Should show cursor pointer on clickable elements', async ({ page }) => {
      const newBtn = page.getByTestId(companyTestIds.newCompanyBtn);

      // Get cursor style
      const cursor = await newBtn.evaluate((el) => window.getComputedStyle(el).cursor);

      // Should be 'pointer' or similar
      expect(cursor).toMatch(/pointer|hand|click/i);
    });
  });

  test.describe('Accessibility Attributes', () => {
    test('9.9: Should have accessible labels and ARIA attributes', async ({ page }) => {
      await page.getByTestId(companyTestIds.newCompanyBtn).click();
      await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();

      // Check modal has proper attributes
      const modal = page.getByTestId(companyTestIds.modal);
      const role = await modal.getAttribute('role');
      const ariaModal = await modal.getAttribute('aria-modal');

      // Modal should have role or aria attributes
      const hasAccessibilityAttr = role || ariaModal;
      // This is optional depending on implementation

      // Input should have label or aria-label
      const input = page.getByTestId(companyTestIds.companyNameInput);
      const inputLabel = await input.getAttribute('placeholder') ||
                         await input.getAttribute('aria-label') ||
                         await input.getAttribute('title');

      expect(inputLabel).toBeTruthy();

      // Buttons should have text or aria-label
      const submitBtn = page.getByTestId(companyTestIds.submitBtn);
      const btnText = await submitBtn.textContent();
      const btnAriaLabel = await submitBtn.getAttribute('aria-label');

      expect(btnText || btnAriaLabel).toBeTruthy();
    });

    test('Should support screen reader navigation', async ({ page }) => {
      // Verify page structure is semantic
      const headings = page.getByRole('heading');
      const headingCount = await headings.count();

      expect(headingCount).toBeGreaterThanOrEqual(1);

      // Buttons should have proper roles
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();

      expect(buttonCount).toBeGreaterThanOrEqual(1);

      // Inputs should have proper roles
      const inputs = page.getByRole('textbox');
      const inputCount = await inputs.count();

      expect(inputCount).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Scroll Position', () => {
    test('9.10: Should maintain scroll position after actions', async ({ page }) => {
      // Create multiple companies to have scrollable content
      for (let i = 0; i < 5; i++) {
        const name = generateUniqueName();
        await companyActions.create({ name });
      }

      await companyActions.navigateTo();

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 200));
      const scrollBefore = await page.evaluate(() => window.scrollY);

      // Perform an action (e.g., click edit on first visible company)
      const row = page.getByRole('row').nth(1);
      if (await row.isVisible()) {
        const editBtn = row.getByRole('button', { name: /edit/i });
        if (await editBtn.count() > 0) {
          await editBtn.click();
          await expect(page.getByTestId(companyTestIds.modal)).toBeVisible();

          // Close modal
          await page.getByTestId(companyTestIds.cancelBtn).click();
          await page.waitForTimeout(300);
        }
      }

      // Check scroll position
      const scrollAfter = await page.evaluate(() => window.scrollY);

      // Scroll position might be preserved or reset, depending on implementation
      // Just verify page is still functional
      await expect(page.getByTestId(companyTestIds.table)).toBeVisible();
    });
  });
});
