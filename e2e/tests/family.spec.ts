import { test, expect } from '@playwright/test';
import { registerHousehold, joinHousehold } from './helpers';

test('an invited member joins, sees shared data, and can be promoted', async ({ browser }) => {
  // Admin creates a household and adds a shared shopping item
  const adminCtx = await browser.newContext();
  const admin = await adminCtx.newPage();
  await registerHousehold(admin, { name: 'Ada', familyName: 'Casa Shared' });

  await admin.getByRole('link', { name: 'Shopping', exact: true }).click();
  await admin.getByPlaceholder('Add an item…').fill('SharedMilk');
  await admin.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(admin.getByText('SharedMilk')).toBeVisible();

  // Read the invite code from the family page
  await admin.getByRole('link', { name: /Ada/ }).click();
  await expect(admin.getByRole('heading', { name: '👪 Family' })).toBeVisible();
  const inviteCode = (await admin.locator('p.font-mono').innerText()).trim();
  expect(inviteCode).toHaveLength(8);

  // A new person joins that household with the code, in a separate session
  const memberCtx = await browser.newContext();
  const member = await memberCtx.newPage();
  await joinHousehold(member, { name: 'Ben', inviteCode });

  // The member sees the shared shopping item
  await member.getByRole('link', { name: 'Shopping', exact: true }).click();
  await expect(member.getByText('SharedMilk')).toBeVisible();

  // The admin now sees Ben and can promote him
  await admin.reload();
  await expect(admin.getByText('Ben', { exact: true })).toBeVisible();
  await admin.getByRole('button', { name: 'Make admin' }).click();
  await expect(admin.getByText('Ben is now an admin.')).toBeVisible();

  await adminCtx.close();
  await memberCtx.close();
});
