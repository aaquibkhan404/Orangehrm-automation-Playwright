import { Page, Locator, expect } from '@playwright/test';

export class AdminPage {
  readonly page: Page;
  readonly adminMenu: Locator;
  readonly addUserButton: Locator;
  readonly userRoleDropdown: Locator;
  readonly employeeNameInput: Locator;
  readonly statusDropdown: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveButton: Locator;
  readonly searchUsernameInput: Locator;
  readonly searchButton: Locator;
  readonly searchResultRow: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.adminMenu = page.locator('span:has-text("Admin")');
    this.addUserButton = page.locator('button:has-text("Add")');
    this.userRoleDropdown = page.locator('div.oxd-form-row').filter({ hasText: 'User Role' })
      .locator('div.oxd-select-text');
    this.employeeNameInput = page.locator('input[placeholder="Type for hints..."]');
    this.statusDropdown = page.locator('div.oxd-form-row').filter({ hasText: 'Status' })
      .locator('div.oxd-select-text');
    this.usernameInput = page.locator('div.oxd-form-row').filter({ hasText: 'Username' })
      .locator('input');
    this.passwordInput = page.locator('div.oxd-form-row').filter({ hasText: 'Password' })
      .locator('input');
    this.confirmPasswordInput = page.locator('div.oxd-form-row').filter({ hasText: 'Confirm Password' })
      .locator('input');
    this.saveButton = page.locator('button:has-text("Save")');
    this.searchUsernameInput = page.locator('label:has-text("Username") + div input').nth(1);
    this.searchButton = page.locator('button:has-text("Search")');
    this.searchResultRow = page.locator('.oxd-table-card');
    this.editButton = page.locator('button:has-text("Edit")').first();
    this.deleteButton = page.locator('button:has-text("Delete")').first();
    this.confirmDeleteButton = page.locator('button:has-text("Yes, Delete")');
  }

  async navigateToAdminModule() {
    await this.adminMenu.click();
    await expect(this.page).toHaveURL(/admin/);
    await expect(this.addUserButton).toBeVisible();
  }

  async addUser(userData: {
    userRole: string;
    employeeName: string;
    status: string;
    username: string;
    password: string;
  }) {
    await this.addUserButton.click();
    await expect(this.page.locator('h6:has-text("Add User")')).toBeVisible();

    // Select User Role with retry logic
    await this.selectDropdownWithRetry(
      this.userRoleDropdown,
      userData.userRole,
      3 // max retries
    );

    // Type Employee Name and select from suggestions
    await this.employeeNameInput.fill(userData.employeeName);
    await this.page.waitForTimeout(1000); // Wait for suggestions
    
    const employeeOption = this.page.locator('.oxd-autocomplete-dropdown:visible')
      .locator(`span:has-text("${userData.employeeName}")`);
    await employeeOption.waitFor({ state: 'visible' });
    await employeeOption.click();

    // Select Status
    await this.selectDropdownOption(this.statusDropdown, userData.status);

    // Fill username and password
    await this.usernameInput.fill(userData.username);
    await this.passwordInput.fill(userData.password);
    await this.confirmPasswordInput.fill(userData.password);

    await this.saveButton.click();
    await expect(this.page.getByText('Successfully Saved')).toBeVisible({ timeout: 15000 });
  }

  private async selectDropdownOption(dropdownLocator: Locator, optionText: string) {
    await dropdownLocator.click();
    await this.page.waitForTimeout(300);
    
    const dropdownOptions = this.page.locator('.oxd-select-dropdown:visible');
    await dropdownOptions.waitFor({ state: 'visible' });
    
    const option = dropdownOptions.locator(`.oxd-select-option:has-text("${optionText}")`);
    await option.waitFor({ state: 'visible' });
    await option.click();
    
    await this.page.waitForTimeout(300); // Wait for selection to apply
  }

  private async selectDropdownWithRetry(dropdownLocator: Locator, optionText: string, maxRetries: number) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        await this.selectDropdownOption(dropdownLocator, optionText);
        
        // Verify selection was successful
        const selectedValue = await dropdownLocator.textContent();
        if (selectedValue?.includes(optionText)) {
          return;
        }
        throw new Error('Selection not applied');
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(`Failed to select "${optionText}" after ${maxRetries} attempts`);
        }
        await this.page.waitForTimeout(500);
      }
    }
  }

  async searchUser(username: string) {
    await this.searchUsernameInput.fill(username);
    await this.searchButton.click();
    await expect(this.searchResultRow).toBeVisible();
  }

  async editUser(newData: {
    userRole?: string;
    status?: string;
    username?: string;
  }) {
    await this.editButton.click();
    await expect(this.page.locator('h6:has-text("Edit User")')).toBeVisible();

    if (newData.userRole) {
      await this.selectDropdownOption(this.userRoleDropdown, newData.userRole);
    }
    
    if (newData.status) {
      await this.selectDropdownOption(this.statusDropdown, newData.status);
    }
    
    if (newData.username) {
      await this.usernameInput.fill(newData.username);
    }
    
    await this.saveButton.click();
    await expect(this.page.getByText('Successfully Updated')).toBeVisible({ timeout: 10000 });
  }

  async deleteUser() {
    await this.deleteButton.click();
    await expect(this.confirmDeleteButton).toBeVisible();
    await this.confirmDeleteButton.click();
    await expect(this.page.getByText('Successfully Deleted')).toBeVisible({ timeout: 10000 });
  }

  async verifyUserDetails(expectedDetails: {
    username?: string;
    userRole?: string;
    employeeName?: string;
    status?: string;
  }) {
    if (expectedDetails.username) {
      await expect(this.searchResultRow).toContainText(expectedDetails.username);
    }
    if (expectedDetails.userRole) {
      await expect(this.searchResultRow).toContainText(expectedDetails.userRole);
    }
    if (expectedDetails.employeeName) {
      await expect(this.searchResultRow).toContainText(expectedDetails.employeeName);
    }
    if (expectedDetails.status) {
      await expect(this.searchResultRow).toContainText(expectedDetails.status);
    }
  }
}