import { type Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { TestUser, testUsers } from '../data/user';


/**
 * Reusable authentication actions
 * These are higher-level flows that combine multiple page interactions
 */

/**
 * Login as a specific user and verify success
 */
export async function loginAs(page: Page, user: TestUser): Promise<void> {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(user.email, user.password);
  await expect(page.locator('app-navbar')).toBeVisible();
}

/**
 * Quick login as admin user
 */
export async function login(page: Page): Promise<void> {
  await loginAs(page, testUsers.admin);
}

/**
 * Attempt login with invalid credentials (for negative testing)
 */
export async function attemptLoginWithInvalidCredentials(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(email, password);

  // Verify error is displayed
  await loginPage.verifyErrorDisplayed();
}
