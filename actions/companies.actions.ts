import { ro } from "@faker-js/faker";
import { Locator, Page, expect } from "@playwright/test";

/**
 * Common locators and actions for Companies module
 */

// Common Test IDs
export const companyTestIds = {
  // Buttons
  newCompanyBtn: "companies-btn-new",
  cancelBtn: "companies-btn-cancel",
  submitBtn: "companies-btn-submit",
  updateBtn: "companies-btn-update",
  deleteBtn: "companies-btn-delete",
  deleteConfirmBtn: "companies-btn-confirm-delete",
  deleteCancelBtn: "companies-btn-cancel-delete",
  bulkDeleteBtn: "companies-table-btn-bulk-delete",
  

  // Inputs
  companyNameInput: "companies-input-name",
  searchInput: "companies-table-search",

  // Table
  table: "companies-table",
  selectAllCheckbox: "companies-table-select-all",
  tableRow: "companies-table-body-row",

  // Modals
  modal: "companies-modal",
  deleteModal: "companies-delete-modal",

  // Other
  selectedItemsArea: "companies-table-selected-item",
  pagination: "companies-table-pagination"
};

export interface CompanyData {
  name?: string;
}

/**
 * CompanyActions class encapsulates all company-related UI interactions
 */
export class CompanyActions {
  constructor(private page: Page) {}

  // ==================== Public Methods ====================

  /**
   * Navigate to the companies page
   */
  async navigateTo(): Promise<void> {
    await this.page.goto("/companies");
    await expect(this.page.getByTestId(companyTestIds.table)).toBeVisible();
  }

  /**
   * Create a new company with the provided data
   */
  async create(companyData: CompanyData): Promise<void> {
    await this.navigateTo();
    await this.openNewModal();

    if (companyData.name) {
      await this.fillCompanyName(companyData.name);
    }

    await this.submit();
  }

  /**
   * Edit an existing company
   */
  async edit(originalName: string, newCompanyData: CompanyData): Promise<void> {
    await this.navigateTo();
    await this.openEditByName(originalName);

    if (newCompanyData.name) {
      await this.fillCompanyName(newCompanyData.name);
    }

    await this.submitUpdate();
  }

  /**
   * Delete a company by name
   */
  async delete(companyName: string): Promise<void> {
    await this.navigateTo();
    await this.clickDeleteByName(companyName);
    await this.confirmDelete();
  }

  /**
   * Verify that a company exists in the table
   */
  async verifyExists(companyName: string): Promise<void> {
    await this.navigateTo();
    const row = await this.findRowByName(companyName);
    await expect(row).toBeVisible();
  }

  /**
   * Verify that a company does not exist in the table
   */
  async verifyNotExists(companyName: string): Promise<void> {
    await this.page.getByTestId(companyTestIds.searchInput).fill(companyName);    
    await expect(this.page.getByTestId(companyTestIds.table).getByRole('cell')).toContainText('No data available');
  }

  /**
   * Search for a company
   */
  async search(searchTerm: string): Promise<void> {
    await this.page.getByTestId(companyTestIds.searchInput).clear();
    await this.page.getByTestId(companyTestIds.searchInput).fill(searchTerm);
    await this.page.waitForTimeout(300);
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    await this.page.getByTestId(companyTestIds.searchInput).clear();
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    const btn = this.page.getByTestId(companyTestIds.submitBtn);
    return !(await btn.isDisabled());
  }

  /**
   * Check if update button is enabled
   */
  async isUpdateButtonEnabled(): Promise<boolean> {
    const btn = this.page.getByTestId(companyTestIds.updateBtn);
    return !(await btn.isDisabled());
  }

  /**
   * Get table row count (excluding header)
   */
  async getTableRowCount(prefixName: string): Promise<number> {
    await this.search(prefixName);
    const rows = await this.page.getByTestId('companies-table-body-row').count();
    return rows
  }

  /**
   * Select company by checkbox
   */
  async selectCompany(companyName: string): Promise<void> {
    const row = await this.findRowByName(companyName);
    const checkbox = row.getByTestId("checkbox-table").first();
    await checkbox.click();
  }

  /**
   * Deselect company by checkbox
   */
  async deselectCompany(companyName: string): Promise<void> {
    const row = await this.findRowByName(companyName);
    const checkbox = row.locator('input[type="checkbox"]').first();
    await checkbox.uncheck();
  }

  // ==================== Private Methods ====================

  /**
   * Open the "New Company" modal
   */
  private async openNewModal(): Promise<void> {
    await this.page.getByTestId(companyTestIds.newCompanyBtn).click();
    await expect(this.page.getByTestId(companyTestIds.modal)).toBeVisible();
  }

  /**
   * Open edit modal for a company by name
   */
  async openEditByName(companyName: string): Promise<void> {
    const row = await this.findRowByName(companyName);
    await row?.getByRole("button", { name: "Edit" }).click();
    await expect(this.page.getByTestId(companyTestIds.modal)).toBeVisible();
  }

  /**
   * Click delete button for a company by name
   */
  private async clickDeleteByName(companyName: string): Promise<void> {
    const row = await this.findRowByName(companyName);
    await row?.getByRole("button", { name: "Delete" }).click();
    await expect(this.page.getByTestId(companyTestIds.deleteModal)).toBeVisible();
  }

  /**
   * Find a company row by name in the table
   */
  async findRowByName(name: string): Promise<Locator> {
    await this.page.getByTestId(companyTestIds.searchInput).fill(name);
    await this.page.waitForTimeout(300);
    return this.page.getByTestId(companyTestIds.tableRow).filter({ hasText: name }).first();
  }

  /**
   * Fill the company name input
   */
  private async fillCompanyName(name: string): Promise<void> {
    await this.page.getByTestId(companyTestIds.companyNameInput).fill(name);
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(300);
  }

  /**
   * Submit the create form
   */
  private async submit(): Promise<void> {
    await this.page.getByTestId(companyTestIds.submitBtn).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Submit the update form
   */
  private async submitUpdate(): Promise<void> {
    await this.page.getByTestId(companyTestIds.submitBtn).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Confirm delete action
   */
  private async confirmDelete(): Promise<void> {
    await this.page.getByTestId(companyTestIds.deleteConfirmBtn).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Cancel modal
   */
  async cancelModal(): Promise<void> {
    await this.page.getByTestId(companyTestIds.cancelBtn).click();
  }
}
