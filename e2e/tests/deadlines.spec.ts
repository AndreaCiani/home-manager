import { test, expect } from '@playwright/test';
import { registerHousehold } from './helpers';

test('add a deadline, see it as due soon, and mark it paid', async ({ page }) => {
  await registerHousehold(page, { name: 'Dan', familyName: 'Casa Dan' });

  // Bills is reached from the Home hub (not the bottom bar)
  await page.getByRole('link', { name: /Bills/ }).click();
  await expect(page.getByRole('heading', { name: /Deadlines/ })).toBeVisible();

  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const iso = inThreeDays.toISOString().slice(0, 10);

  await page.getByPlaceholder('Title (e.g. Car insurance)').fill('Car insurance');
  await page.getByLabel('Due date').fill(iso);
  await page.getByRole('button', { name: 'Add deadline' }).click();

  await expect(page.getByText('Car insurance').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Due soon/ })).toBeVisible();
  await expect(page.getByText('Due in 3 days').first()).toBeVisible();

  await page.getByRole('button', { name: 'Mark paid' }).first().click();
  await expect(page.getByText('✓ Paid').first()).toBeVisible();
});
