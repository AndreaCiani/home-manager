import { Page, expect } from '@playwright/test';

let counter = 0;

/** A unique email so each test is independent against the shared backend. */
export function uniqueEmail(prefix = 'user'): string {
  counter += 1;
  return `e2e_${prefix}_${Date.now()}_${counter}@test.local`;
}

export const PASSWORD = 'password123';

/** Registers a brand-new household and lands on the dashboard. Returns the credentials. */
export async function registerHousehold(
  page: Page,
  opts: { name: string; familyName: string },
): Promise<{ email: string; password: string }> {
  const email = uniqueEmail(opts.name.toLowerCase());
  await page.goto('/register');
  await page.getByPlaceholder('Your name').fill(opts.name);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password (min 8 characters)').fill(PASSWORD);
  await page.getByRole('button', { name: 'New household' }).click();
  await page.getByPlaceholder('Household name (optional)').fill(opts.familyName);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: '🏠 Overview' })).toBeVisible();
  return { email, password: PASSWORD };
}

/** Registers a member joining an existing household via its invite code. */
export async function joinHousehold(
  page: Page,
  opts: { name: string; inviteCode: string },
): Promise<{ email: string; password: string }> {
  const email = uniqueEmail(opts.name.toLowerCase());
  await page.goto('/register');
  await page.getByPlaceholder('Your name').fill(opts.name);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password (min 8 characters)').fill(PASSWORD);
  // "Join a family" is the default mode; fill the invite code.
  await page.getByPlaceholder('Invite code').fill(opts.inviteCode);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: '🏠 Overview' })).toBeVisible();
  return { email, password: PASSWORD };
}
