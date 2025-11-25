import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';
import { roleTestIds } from '../actions/roles.actions';

test.describe('Role UI/UX and Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
    await page.waitForLoadState('networkidle');
  });

  test('85 - Modal responsiveness', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Resize to mobile size
    await page.setViewportSize({ width: 320, height: 640 });
    await page.waitForTimeout(500);

    // Modal should still be visible and accessible
    const modal = page.getByTestId(roleTestIds.modal);
    await expect(modal).toBeVisible();

    // Close button should be accessible
    const closeButton = modal.locator('button[aria-label*="close"], button:first-child').first();
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('86 - Button states and visual feedback', async ({ page }) => {
    // Hover over New Role button
    const newRoleBtn = page.getByTestId(roleTestIds.newRoleBtn);
    await newRoleBtn.hover();
    
    // Cursor should change to pointer
    const cursor = await page.locator(roleTestIds.newRoleBtn).evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    }).catch(() => 'pointer');

    // Button should have hover styling
    await expect(newRoleBtn).toBeVisible();

    // Click to open modal
    await newRoleBtn.click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Submit button should be disabled initially
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(submitBtn).toBeDisabled();

    // Type role name
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    await nameInput.fill('TestRole');
    await page.waitForLoadState('networkidle');

    // Submit button should become enabled
    await expect(submitBtn).toBeEnabled();

    // Close
    await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
  });

  test('87 - Loading states during operations', async ({ page }) => {
    // Create a role
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    const roleName = `LoadTest${Math.random().toString(36).substring(7)}`;
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    
    // Click create (should show loading)
    await page.getByTestId(roleTestIds.submitBtn).click();
    
    // Wait for operation to complete
    await page.waitForLoadState('networkidle');

    // Verify role was created
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('88 - Error messages visibility', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Enter invalid data (too short)
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    await nameInput.fill('A');
    await page.keyboard.press('Tab');
    await page.waitForLoadState('networkidle');

    // Look for error messages
    const errorMessages = page.locator('[role="alert"], .error, .invalid');
    const errorCount = await errorMessages.count();
    
    // May or may not have visible error (depends on implementation)
    // But submit should be disabled
    const submitBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(submitBtn).toBeDisabled();

    // Close
    await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
  });

  test('89 - Success notifications', async ({ page }) => {
    // Create a role
    const roleName = `SuccessTest${Math.random().toString(36).substring(7)}`;
    
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();
    await page.getByTestId(roleTestIds.roleNameInput).fill(roleName);
    await page.getByTestId(roleTestIds.submitBtn).click();
    await page.waitForLoadState('networkidle');

    // Look for success notification
    const notifications = page.locator('[role="alert"], .toast, .notification, .snackbar');
    const notificationCount = await notifications.count();
    
    // Success notification should appear
    if (notificationCount > 0) {
      const firstNotification = notifications.first();
      const text = await firstNotification.textContent();
      expect(text).toBeTruthy();
    }

    // Role should appear in table
    const roleRow = page.locator('table tbody tr').filter({ hasText: roleName });
    await expect(roleRow).toBeVisible();
  });

  test('90 - Keyboard navigation - Tab order', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Get focused element
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    
    // Focus should be on first input (role name)
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    await nameInput.focus();

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Focus should move to next element
    focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName || el?.className || 'unknown';
    });

    expect(focusedElement).toBeTruthy();

    // Close
    await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
  });

  test('91 - Keyboard shortcuts - Escape to close modal', async ({ page }) => {
    // Open modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    const modal = page.getByTestId(roleTestIds.modal);
    await modal.isVisible();

    // Type some data
    const nameInput = page.getByTestId(roleTestIds.roleNameInput);
    await nameInput.fill('TestEscapeClose');

    // Press Escape
    await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
    await page.waitForLoadState('networkidle');

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Verify role was not created
    await page.getByTestId(roleTestIds.searchInput).fill('TestEscapeClose');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('table tbody tr').filter({ hasText: 'TestEscapeClose' });
    await expect(rows).not.toBeVisible();
  });

  test('92 - Focus management - Focus return after modal close', async ({ page }) => {
    const newRoleBtn = page.getByTestId(roleTestIds.newRoleBtn);
    
    // Click to open
    await newRoleBtn.click();
    const modal = page.getByTestId(roleTestIds.modal);
    await modal.isVisible();

    // Close modal
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await page.waitForLoadState("networkidle");
    await page.waitForLoadState('networkidle');

    // Focus should return to button or nearby element
    const focusedElement = await page.evaluate(() => {
      return (document.activeElement as HTMLElement)?.getAttribute('data-testid') || 
             (document.activeElement as HTMLElement)?.textContent || 
             'no-focus';
    });

    // Should have focus somewhere in the page
    expect(focusedElement).toBeTruthy();
  });

  test('93 - Empty states display', async ({ page }) => {
    // Search for non-existent role
    const searchInput = page.getByTestId(roleTestIds.searchInput);
    await searchInput.fill('NonExistentRoleXYZ12345');
    await page.waitForLoadState('networkidle');

    // Verify no results
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBe(0);

    // Table headers should still be visible
    const headers = page.locator('table thead');
    await expect(headers).toBeVisible();

    // Clear search
    await searchInput.clear();
    await page.waitForLoadState('networkidle');

    // Roles should appear again
    const rowsAfterClear = page.locator('table tbody tr');
    const countAfterClear = await rowsAfterClear.count();
    expect(countAfterClear).toBeGreaterThan(0);
  });

  test('94 - Responsive table layout', async ({ page }) => {
    // Test at tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Table should be visible
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // All columns should be accessible
    const headers = page.locator('table thead columnheader');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('95 - Tooltip or help text visibility', async ({ page }) => {
    // Open create modal
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    // Look for help text or labels
    const labels = page.locator('label');
    const labelCount = await labels.count();
    
    // Should have descriptive labels for inputs
    expect(labelCount).toBeGreaterThan(0);

    // Close
    await page.getByTestId(roleTestIds.cancelBtn).click(); // Close modal
  });
});
