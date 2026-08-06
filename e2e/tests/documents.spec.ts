import { test, expect } from '@playwright/test';
import { registerHousehold } from './helpers';

test('upload a document from the hub and see it listed', async ({ page }) => {
  await registerHousehold(page, { name: 'Doc', familyName: 'Casa Doc' });

  // Documents is reached from the Home hub
  await page.getByRole('link', { name: /Documents/ }).click();
  await expect(page.getByRole('heading', { name: '📄 Documents' })).toBeVisible();

  await page.getByLabel('File').setInputFiles({
    name: 'passport.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test document'),
  });
  await page.getByPlaceholder('Name (e.g. Car insurance policy)').fill('Passport');
  await page.getByRole('button', { name: 'Upload document' }).click();

  await expect(page.getByText('Passport', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Download Passport/ })).toBeVisible();
});
