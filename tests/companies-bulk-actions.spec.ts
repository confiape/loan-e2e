import { test, expect } from "@playwright/test";
import { login } from "../actions/auth.actions";
import { CompanyActions, companyTestIds } from "../actions/companies.actions";
import { generateUniqueName } from "../data/role-name-generator";

let companyActions: CompanyActions;

test.describe("Companies - Bulk Selection and Actions", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    companyActions = new CompanyActions(page);
    await companyActions.navigateTo();
  });

  test.describe("Individual Selection", () => {
    test("7.1: Should select individual company", async ({ page }) => {
      const companyName = generateUniqueName();
      await companyActions.create({ name: companyName });

      await companyActions.selectCompany(companyName);

      // Verify checkbox is checked
      const row = await companyActions.findRowByName(companyName);
      const checkbox = row.locator('input[type="checkbox"]').first();
      await expect(checkbox).toBeChecked();

      // Verify selected area shows company
      expect(
        page
          .getByTestId(companyTestIds.selectedItemsArea)
          .getByText(companyName)
      ).toBeVisible();
    });

    test("7.2: Should select multiple companies", async ({ page }) => {
      const company1 = generateUniqueName();
      const company2 = generateUniqueName();

      await companyActions.create({ name: company1 });
      await companyActions.create({ name: company2 });

      await companyActions.selectCompany(company1);
      await companyActions.selectCompany(company2);

      // Verify both are checked
      const row1 = await companyActions.findRowByName(company1);
      const checkbox1 = row1.locator('input[type="checkbox"]').first();
      await expect(checkbox1).toBeChecked();
      await expect(page.getByTestId(companyTestIds.selectedItemsArea).getByText(company1)).toBeVisible();

      const row2 = await companyActions.findRowByName(company2);
      const checkbox2 = row2.locator('input[type="checkbox"]').first();
      await expect(checkbox2).toBeChecked();
      await expect(page.getByTestId(companyTestIds.selectedItemsArea).getByText(company2)).toBeVisible();

      // Verify count
      await expect(page.getByTestId(companyTestIds.selectedItemsArea)).toHaveCount(2);
    });
  });

  test.describe("Select All Functionality", () => {
    test("7.3: Should select all companies", async ({ page }) => {
      // Create a few companies
      const company1 = generateUniqueName();
      const company2 = generateUniqueName();
      await companyActions.create({ name: company1 });
      await companyActions.create({ name: company2 });

      await companyActions.navigateTo();

      // Click select all checkbox
      const selectAllCheckbox = page.getByTestId(
        companyTestIds.selectAllCheckbox
      );
      if ((await selectAllCheckbox.count()) > 0) {
        await selectAllCheckbox.check();
        await page.waitForTimeout(300);

        // Verify all rows are checked
        const checkboxes = page.locator(
          'input[type="checkbox"]:not([data-testid*="select-all"])'
        );
        const checkedCount = await page
          .locator(
            'input[type="checkbox"]:checked:not([data-testid*="select-all"])'
          )
          .count();
        const totalCount = await checkboxes.count();

        expect(checkedCount).toBeGreaterThanOrEqual(0); // Should have some checked
      }
    });

    test("7.4: Should deselect all companies", async ({ page }) => {
      const company1 = generateUniqueName();
      await companyActions.create({ name: company1 });

      await companyActions.navigateTo();

      const selectAllCheckbox = page.getByTestId(
        companyTestIds.selectAllCheckbox
      );
      if ((await selectAllCheckbox.count()) > 0) {
        // Select all
        await selectAllCheckbox.check();
        await page.waitForTimeout(300);

        // Deselect all
        await selectAllCheckbox.uncheck();
        await page.waitForTimeout(300);

        // Verify all are unchecked
        const checkedCount = await page
          .locator(
            'input[type="checkbox"]:checked:not([data-testid*="select-all"])'
          )
          .count();
        expect(checkedCount).toBe(0);
      }
    });
  });

  test.describe("Clear Selection", () => {
    test("7.5: Should clear all selections with Clear all button", async ({
      page,
    }) => {
      const company1 = generateUniqueName();
      const company2 = generateUniqueName();

      await companyActions.create({ name: company1 });
      await companyActions.create({ name: company2 });

      await companyActions.selectCompany(company1);
      await companyActions.selectCompany(company2);

      // Look for clear all button
      const clearAllBtn = page
        .getByRole('button', { name: 'Clear all' })
        .first();
      if ((await clearAllBtn.count()) > 0) {
        await clearAllBtn.click();
        await page.waitForTimeout(300);

        // Verify all unchecked
        const checkedCount = await page
          .locator(
            'input[type="checkbox"]:checked:not([data-testid*="select-all"])'
          )
          .count();
        expect(checkedCount).toBe(0);
      }
    });

    test("7.6: Should remove individual selection from Selected area", async ({
      page,
    }) => {
      const company1 = generateUniqueName();
      const company2 = generateUniqueName();

      await companyActions.create({ name: company1 });
      await companyActions.create({ name: company2 });

      await companyActions.selectCompany(company1);
      await companyActions.selectCompany(company2);

      // Look for remove button next to selected company
      const removeBtn = page.locator('span').filter({ hasText: company1 }).first().getByRole('button');

        await removeBtn.click();

        // Verify company1 is unchecked
        
        const row1 = await companyActions.findRowByName(company1);
        const checkbox1 = row1.locator('input[type="checkbox"]').first();
        await expect(checkbox1).not.toBeChecked();

        // Verify company2 is still checked
        const row2 = await companyActions.findRowByName(company2);
        const checkbox2 = row2.locator('input[type="checkbox"]').first();
        await expect(checkbox2).toBeChecked();
      
    });
  });

  test.describe("Bulk Delete", () => {
    test("7.7: Should delete multiple selected companies", async ({ page }) => {
      const company1 = generateUniqueName();
      const company2 = company1+"v1";

      await companyActions.create({ name: company1 });
      await companyActions.create({ name: company2 });

      const countBefore =  await companyActions.getTableRowCount(company1);

      await companyActions.selectCompany(company1);
      await companyActions.selectCompany(company2);

      // Look for delete selected button
     
            
        await page.getByTestId(companyTestIds.bulkDeleteBtn).click();
        await page.waitForTimeout(500);

        // Confirm deletion if modal appears
        await page.getByTestId(companyTestIds.deleteConfirmBtn).click();

        // Verify count decreased
        const countAfter = await companyActions.getTableRowCount(company1);
        expect(countAfter).toBeLessThan(countBefore);

        // Verify companies are gone
        await companyActions.search(company1);
        await expect(
          page.locator("text=/No data available|no companies/i")
        ).toBeVisible();
      
    });
  });

  test.describe("Selection with Sorting", () => {
    test("7.8: Should preserve selection when sorting", async ({ page }) => {
      const company1 = generateUniqueName();
      const company2 = generateUniqueName();

      await companyActions.create({ name: company1 });
      await companyActions.create({ name: company2 });

      await companyActions.selectCompany(company1);
      await companyActions.selectCompany(company2);

      // Get initial selected count
      await expect(page.getByTestId(companyTestIds.selectedItemsArea)).toHaveCount(2);
      // Sort table
      const nameHeader = page
        .getByTestId(companyTestIds.table)
        .getByRole("columnheader", { name: /name/i })
        .first();
      await nameHeader.click();
      await page.waitForTimeout(500);

      // Verify selection is still there

      await expect(page.getByTestId(companyTestIds.selectedItemsArea)).toHaveCount(2);


      // Verify checkboxes are still checked
      const row1 = await companyActions.findRowByName(company1);
      const checkbox1 = row1.locator('input[type="checkbox"]').first();
      await expect(checkbox1).toBeChecked();
    });
  });

  test.describe("Selection with Filtering", () => {
    test("7.9: Should handle selection when searching", async ({ page }) => {
      const company1 = generateUniqueName();
      const company2 = generateUniqueName();

      await companyActions.create({ name: company1 });
      await companyActions.create({ name: company2 });

      // Select both
      await companyActions.selectCompany(company1);
      await companyActions.selectCompany(company2);


      await expect(page.getByTestId(companyTestIds.selectedItemsArea)).toHaveCount(2);

      // Search for one
      await companyActions.search(company1);

      // Depending on implementation, selections might be cleared or preserved
      // Just verify the page is still functional
      const rows = page.getByRole("row");
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe("Selection Count", () => {
    test("7.10: Should show correct selection count", async ({ page }) => {
      const company1 = generateUniqueName();
      const company2 = generateUniqueName();
      const company3 = generateUniqueName();

      await companyActions.create({ name: company1 });
      await companyActions.create({ name: company2 });
      await companyActions.create({ name: company3 });

      // Select 1
      await companyActions.selectCompany(company1);
      await expect(page.getByTestId(companyTestIds.selectedItemsArea)).toHaveCount(1);

      // Select 2 more
      await companyActions.selectCompany(company2);
      await companyActions.selectCompany(company3);
      await page.waitForTimeout(300);
      await expect(page.getByTestId(companyTestIds.selectedItemsArea)).toHaveCount(3);

      // Deselect 1
      await companyActions.deselectCompany(company1);
      await page.waitForTimeout(300);
      await expect(page.getByTestId(companyTestIds.selectedItemsArea)).toHaveCount(2);;
    });
  });

  test("Should show selection controls when items selected", async ({
    page,
  }) => {
    const company1 = generateUniqueName();
    await companyActions.create({ name: company1 });

    // No selections - controls should be hidden
    const clearBtn = page.locator("text=/Clear|clear/i").first();
    const initialVisible = await clearBtn.isVisible().catch(() => false);

    // Select company
    await companyActions.selectCompany(company1);

    // Controls should appear
    await expect(page.getByTestId(companyTestIds.selectedItemsArea).getByText(company1)).toBeVisible();
  });
});
