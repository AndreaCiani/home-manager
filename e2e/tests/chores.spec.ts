import { test, expect } from '@playwright/test';
import { registerHousehold } from './helpers';

test('add a chore from the hub and mark it done', async ({ page }) => {
  await registerHousehold(page, { name: 'Cora', familyName: 'Casa Cora' });

  // Chores is reached from the Home hub
  await page.getByRole('link', { name: /Chores/ }).click();
  await expect(page.getByRole('heading', { name: '🧹 Chores' })).toBeVisible();

  await page.getByPlaceholder('Chore (e.g. Take out the trash)').fill('Take out the trash');
  await page.getByRole('button', { name: 'Add chore' }).click();
  await expect(page.getByText('Take out the trash')).toBeVisible();

  await page.getByRole('button', { name: 'Mark done' }).first().click();
  await expect(page.getByRole('heading', { name: /Done/ })).toBeVisible();
});
