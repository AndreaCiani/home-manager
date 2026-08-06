import { test, expect } from '@playwright/test';
import { registerHousehold } from './helpers';

test('add, tick and remove a shopping item', async ({ page }) => {
  await registerHousehold(page, { name: 'Sam', familyName: 'Casa Sam' });

  await page.getByRole('link', { name: 'Shopping' }).click();
  await expect(page.getByRole('heading', { name: '🛒 Shopping list' })).toBeVisible();

  await page.getByPlaceholder('Add an item…').fill('Milk');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByText('Milk')).toBeVisible();

  // Tick it as purchased → it moves to "Already purchased"
  await page.getByRole('checkbox', { name: 'Mark Milk as purchased' }).check();
  await expect(page.getByRole('heading', { name: /Already purchased/ })).toBeVisible();

  // Remove it
  await page.getByRole('button', { name: 'Remove Milk' }).click();
  await expect(page.getByText('Nothing to buy')).toBeVisible();
});
