/**
 * Test user fixtures
 * Contains test user credentials for E2E e2e
 *
 * IMPORTANT: These are TEST credentials only.
 * Update with real test users from dev.confiape.org environment.
 */

export interface TestUser {
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'analyst';
  name?: string;
}

/**
 * Valid test users
 */
export const testUsers = {
  admin: {
    email: 'admin@confia.com',
    password: 'admin@confia.com@@',
    role: 'admin' as const,
    name: 'Admin User',
  },
  regularUser: {
    email: 'admin@confia.com',
    password: 'admin@confia.com@@',
    role: 'user' as const,
    name: 'Regular User',
  },
  analyst: {
    email: 'admin@confia.com',
    password: 'admin@confia.com@@',
    role: 'analyst' as const,
    name: 'Analyst User',
  },
} satisfies Record<string, TestUser>;

/**
 * Invalid credentials for negative testing
 */
export const invalidCredentials = {
  wrongPassword: {
    email: 'admin@confiape.org',
    password: 'WrongPassword123!',
  },
  nonExistentUser: {
    email: 'nonexistent@confiape.org',
    password: 'Password123!',
  },
  emptyEmail: {
    email: '',
    password: 'Password123!',
  },
  emptyPassword: {
    email: 'admin@confiape.org',
    password: '',
  },
  invalidEmail: {
    email: 'not-an-email',
    password: 'Password123!',
  },
} satisfies Record<string, Pick<TestUser, 'email' | 'password'>>;
