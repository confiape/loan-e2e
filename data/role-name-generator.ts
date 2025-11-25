import { faker } from '@faker-js/faker';

/**
 * Generates unique role names with pattern: TestRole_[Word][Word][5digits]
 * Examples: TestRole_AdminManager47291, TestRole_SalesCobrador38472
 */
export function generateUniqueName(): string {
  return `SearchTest${faker.string.alphanumeric({ length: 5 })}`;
}
