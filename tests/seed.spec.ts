import { test, expect } from '@playwright/test';
import { login } from '../actions/auth.actions';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await login(page);
  });
});
