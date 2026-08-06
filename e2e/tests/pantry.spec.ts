import { test, expect } from '@playwright/test';
import { registerHousehold } from './helpers';

test('add a product that is about to expire and see it highlighted', async ({ page }) => {
  await registerHousehold(page, { name: 'Pia', familyName: 'Casa Pia' });

  await page.getByRole('link', { name: 'Pantry', exact: true }).click();
  await expect(page.getByRole('heading', { name: '📦 Pantry' })).toBeVisible();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const iso = tomorrow.toISOString().slice(0, 10);

  await page.getByPlaceholder('Product name (e.g. Milk)').fill('Yogurt');
  await page.getByLabel('Expiry date').fill(iso);
  await page.getByRole('button', { name: 'Add to pantry' }).click();

  // The product shows (it appears both in the "Expiring" and full lists)
  await expect(page.getByText('Yogurt').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Expiring \(/ })).toBeVisible();
  await expect(page.getByText('Expires tomorrow').first()).toBeVisible();
});
