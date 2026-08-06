import { test, expect } from '@playwright/test';
import { registerHousehold } from './helpers';

test('add an expense and see it counted in this month', async ({ page }) => {
  await registerHousehold(page, { name: 'Bud', familyName: 'Casa Bud' });

  // Budget is reached from the Home hub
  await page.getByRole('link', { name: /Budget/ }).click();
  await expect(page.getByRole('heading', { name: '💰 Budget' })).toBeVisible();

  await page.getByPlaceholder('Description (e.g. Groceries)').fill('Groceries');
  await page.getByPlaceholder('Amount (€)').fill('42');
  // date defaults to today
  await page.getByRole('button', { name: 'Add expense' }).click();

  await expect(page.getByText('Groceries', { exact: true })).toBeVisible();
  await expect(page.getByText('€42.00').first()).toBeVisible();
});
