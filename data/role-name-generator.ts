import { faker } from '@faker-js/faker';

/**
 * Generates unique role names with pattern: TestRole_[Word][Word][5digits]
 * Examples: TestRole_AdminManager47291, TestRole_SalesCobrador38472
 */
export function generateUniquePythonName(): string {
  const word1 = faker.word.adjective();
  const word2 = faker.word.noun();
  const digits = faker.number.int({ min: 10000, max: 99999 });

  return `TestRole_${word1}${word2}${digits}`;
}

/**
 * Generate a simpler unique name for edge case testing
 */
export function generateSimpleUniqueName(): string {
  const word = faker.word.adjective();
  const digits = faker.number.int({ min: 10000, max: 99999 });

  return `${word}Role${digits}`;
}
