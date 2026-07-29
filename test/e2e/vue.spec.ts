import { expect, test } from '@playwright/test';

test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /从飞牛 NAS 到云原生/ })).toBeVisible();
  await expect(page.getByText('最新文章')).toBeVisible();
});
