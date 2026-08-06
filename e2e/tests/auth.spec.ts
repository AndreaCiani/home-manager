import { test, expect } from '@playwright/test';
import { registerHousehold } from './helpers';

test('unauthenticated visits are redirected to login', async ({ page }) => {
  await page.goto('/pantry');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('registering a new household lands on the dashboard', async ({ page }) => {
  await registerHousehold(page, { name: 'Anna', familyName: 'Casa E2E' });
  await expect(page.getByRole('heading', { name: '🏠 Overview' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Anna/ })).toBeVisible();
});

test('logout then log back in', async ({ page }) => {
  const { email, password } = await registerHousehold(page, { name: 'Bea', familyName: 'Casa Bea' });

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: '🏠 Overview' })).toBeVisible();
});

test('wrong password shows an error', async ({ page }) => {
  const { email } = await registerHousehold(page, { name: 'Cleo', familyName: 'Casa Cleo' });
  await page.getByRole('button', { name: 'Log out' }).click();

  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Invalid email or password.')).toBeVisible();
});
