import { Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { AdminPage } from '../pages/admin.page';
import { TestData } from './test-data';

export async function loginAsAdmin(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(TestData.adminCredentials.username, TestData.adminCredentials.password);
  await loginPage.assertLoginSuccess();
}

export async function createTestUser(page: Page) {
  const adminPage = new AdminPage(page);
  await adminPage.navigateToAdminModule();
  await adminPage.addUser({
    ...TestData.user,
    employeeName: TestData.employeeName
  });
  return TestData.user.username;
}