import { test, expect } from "@playwright/test";
import { login } from "../actions/auth.actions";
import { faker } from "@faker-js/faker";
import { createRole, findRoleRowByName, roleTestIds } from "../actions/roles.actions";

// Helper function to generate unique role names
  function generateUniqueName(): string {
    return `TestCreate${faker.string.alphanumeric({
      length: 5,
    })}`;
  }

test.describe("Role Creation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/roles");
    await page.waitForLoadState("networkidle");
  });

  test("1 - Create role with name, inherited role and permissions", async ({
    page,
  }) => {
    const roleName = generateUniqueName();

    // Click New Role button
    await createRole(page, {
      name: roleName,
      inheritedRoles: ["Admin"],
      permissions: ["UserController_GetAllUsers", "UserController_SaveUser"],
    });

    // Search for the role
    await page.getByTestId(roleTestIds.searchInput).fill(roleName);
    await page.waitForLoadState("networkidle");

    // Verify role exists
    const roleRow = page
      .locator("table tbody tr")
      .filter({ hasText: roleName });
    await expect(roleRow).toBeVisible();
  });

  test("2 - Create role with only name", async ({ page }) => {
    const roleName = generateUniqueName();
    await createRole(page, { name: roleName });

    await expect(await findRoleRowByName(page,roleName)).toBeVisible();
  });

  test("3 - Validate empty role name field", async ({ page }) => {
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(createBtn).toBeDisabled();
  });

  test("4 - Validate role name too short (1 character)", async ({ page }) => {
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    await page.getByTestId(roleTestIds.roleNameInput).fill("A");
    await page.keyboard.press("Tab");

    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(createBtn).toBeDisabled();
  });

  test("5 - Validate role name exactly 2 characters (valid)", async ({
    page,
  }) => {
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    await page.getByTestId(roleTestIds.roleNameInput).fill("IT");

    const createBtn = page.getByTestId(roleTestIds.submitBtn);
    await expect(createBtn).toBeEnabled();
  });

  test("6 - Create role with multiple inherited roles", async ({ page }) => {
    const roleName = generateUniqueName();
    const roleName1 = generateUniqueName();
    const roleName2 = generateUniqueName();
    const roleName3 = generateUniqueName();

    await createRole(page, { name: roleName1 });
    await createRole(page, { name: roleName2 });
    await createRole(page, { name: roleName3 });
    

    // Click New Role button
    await createRole(page, {
      name: roleName,
      inheritedRoles: [roleName1, roleName2, roleName3],
      permissions: [],
    });

    await expect(await findRoleRowByName(page,roleName)).toBeVisible()
  });

  test("7 - Create role with multiple permissions", async ({ page }) => {
    const roleName = generateUniqueName();

    // Click New Role button
    await createRole(page, {
      name: roleName,
      inheritedRoles: [],
      permissions: ["ReportsController_ReportPaymentByDay", "ReportsController_ReportPaymentByLoan", "ReportsController_ReportLoansByClientId"],
    });

    await expect(await findRoleRowByName(page,roleName)).toBeVisible()
  });

  test("8 - Cancel role creation", async ({ page }) => {
    const cancelName = "TestCancel123";

    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    await page.getByTestId(roleTestIds.roleNameInput).fill(cancelName);
    await page.getByTestId(roleTestIds.cancelBtn).click();
    await expect(page.getByTestId(roleTestIds.modal)).not.toBeVisible();

    await page.getByTestId("roles-search-input").fill(cancelName);
    
   await expect(await findRoleRowByName(page,cancelName)).not.toBeVisible();
  });

  test("9 - Close modal with Escape key", async ({ page }) => {
    await page.getByTestId(roleTestIds.newRoleBtn).click();
    await page.getByTestId(roleTestIds.modal).isVisible();

    await page.getByTestId(roleTestIds.roleNameInput).fill("TestEscape");
    await page.keyboard.press("Escape");

    await expect(page.getByTestId(roleTestIds.modal)).not.toBeVisible();
  });
});
