import { test, expect } from '@playwright/test';

import { login, loginAs, attemptLoginWithInvalidCredentials } from '../actions/auth.actions';
import { LoginPage } from '../pages/login.page';
import { invalidCredentials, testUsers } from '../data/user';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear session before each test
    await page.context().clearCookies();
  });

  test('should display login page with all elements', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.goto();

    // Assert
    await loginPage.verifyPageLoaded();
  });

  test('should successfully login with valid admin credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);


    // Act
    await loginPage.goto();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);

    // Assert
  });

  test('should successfully login with valid regular user credentials', async ({ page }) => {
    // Arrange & Act
    await loginAs(page, testUsers.regularUser);

    // Assert

  });

  test('should show error message with invalid password', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.goto();
    await loginPage.login(
      invalidCredentials.wrongPassword.email,
      invalidCredentials.wrongPassword.password,
    );

    // Assert
    await loginPage.verifyErrorDisplayed();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error message with non-existent user', async ({ page }) => {
    // Arrange & Act
    await attemptLoginWithInvalidCredentials(
      page,
      invalidCredentials.nonExistentUser.email,
      invalidCredentials.nonExistentUser.password,
    );

    // Assert - verify still on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should not allow login with empty email', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.goto();
    await loginPage.fillEmail(invalidCredentials.emptyEmail.email);
    await loginPage.fillPassword(invalidCredentials.emptyEmail.password);

    // Assert - submit button should be disabled or form should show validation error
    const submitButton = page.getByTestId('login-submit');

    // Check if button is disabled OR if error is shown
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    if (!isDisabled) {
      await loginPage.submit();
      // Should still be on login page
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should not allow login with empty password', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.goto();
    await loginPage.fillEmail(invalidCredentials.emptyPassword.email);
    await loginPage.fillPassword(invalidCredentials.emptyPassword.password);

    // Assert - submit button should be disabled or form should show validation error
    const submitButton = page.getByTestId('login-submit');

    // Check if button is disabled OR if error is shown
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    if (!isDisabled) {
      await loginPage.submit();
      // Should still be on login page
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should persist session after page reload', async ({ page }) => {
    // Arrange & Act
    await login(page);
    await page.reload();

  });
});
