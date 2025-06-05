import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { AdminPage } from '../pages/admin.page';
import { TestData } from '../utils/test-data';

test.describe('OrangeHRM User Management', () => {
  let adminPage: AdminPage;
  let createdUsername: string;

  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(
      TestData.adminCredentials.username,
      TestData.adminCredentials.password
    );
    await loginPage.assertLoginSuccess();
    
    adminPage = new AdminPage(page);
    await adminPage.navigateToAdminModule();
  });

  test('should navigate to Admin module', async ({ page }) => {
    await expect(page).toHaveURL(/admin/);
    await expect(adminPage.addUserButton).toBeVisible();
  });

  test('should add a new ESS user', async ({ page }) => {
    createdUsername = `testuser_${Math.floor(Math.random() * 10000)}`;
    
    await adminPage.addUser({
      userRole: TestData.userRoles.ess,
      employeeName: TestData.employee.name,
      status: TestData.statusOptions.enabled,
      username: createdUsername,
      password: TestData.passwords.valid
    });

    // Verify user is created
    await adminPage.searchUser(createdUsername);
    await adminPage.verifyUserDetails({
      username: createdUsername,
      userRole: TestData.userRoles.ess,
      employeeName: TestData.employee.name,
      status: TestData.statusOptions.enabled
    });
  });

  test('should add a new Admin user', async ({ page }) => {
    createdUsername = `adminuser_${Math.floor(Math.random() * 10000)}`;
    
    await adminPage.addUser({
      userRole: TestData.userRoles.admin,
      employeeName: TestData.employee.name,
      status: TestData.statusOptions.enabled,
      username: createdUsername,
      password: TestData.passwords.valid
    });

    // Verify admin user is created
    await adminPage.searchUser(createdUsername);
    await adminPage.verifyUserDetails({
      username: createdUsername,
      userRole: TestData.userRoles.admin,
      employeeName: TestData.employee.name,
      status: TestData.statusOptions.enabled
    });
  });

  test('should search for a user', async ({ page }) => {
    // First create a user to search for
    const username = await createTestUser(page);
    
    // Now search for the user
    await adminPage.searchUser(username);
    await expect(adminPage.searchResultRow).toBeVisible();
    await adminPage.verifyUserDetails({
      username: username,
      userRole: TestData.userRoles.ess
    });
  });

  test('should edit user details and promote to Admin', async ({ page }) => {
    const username = await createTestUser(page);
    
    // Search and edit the user
    await adminPage.searchUser(username);
    const newUsername = `edited_${Math.floor(Math.random() * 10000)}`;
    
    await adminPage.editUser({
      userRole: TestData.userRoles.admin,
      status: TestData.statusOptions.disabled,
      username: newUsername
    });

    // Verify changes
    await adminPage.searchUser(newUsername);
    await adminPage.verifyUserDetails({
      username: newUsername,
      userRole: TestData.userRoles.admin,
      status: TestData.statusOptions.disabled
    });
  });

  test('should delete a user', async ({ page }) => {
    const username = await createTestUser(page);
    
    // Search and delete the user
    await adminPage.searchUser(username);
    await adminPage.deleteUser();
    
    // Verify user is deleted
    await adminPage.searchUser(username);
    await expect(adminPage.searchResultRow).not.toBeVisible();
  });

  test('should verify user cannot be created with invalid password', async ({ page }) => {
    const username = `testuser_${Math.floor(Math.random() * 10000)}`;
    
    try {
      await adminPage.addUser({
        userRole: TestData.userRoles.ess,
        employeeName: TestData.employee.name,
        status: TestData.statusOptions.enabled,
        username: username,
        password: TestData.passwords.tooShort
      });
      await expect(page.getByText('Successfully Saved')).not.toBeVisible();
    } catch (error) {
      await expect(page.getByText(/Password must be at least/i)).toBeVisible();
    }
  });
});

/**
 * Helper function to create a test ESS user
 * @param page Playwright Page object
 * @returns Generated username
 */
async function createTestUser(page: Page): Promise<string> {
  const adminPage = new AdminPage(page);
  const username = `testuser_${Math.floor(Math.random() * 10000)}`;
  
  await adminPage.addUser({
    userRole: TestData.userRoles.ess,
    employeeName: TestData.employee.name,
    status: TestData.statusOptions.enabled,
    username: username,
    password: TestData.passwords.valid
  });
  
  return username;
}