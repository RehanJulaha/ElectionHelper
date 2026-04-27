import { expect, test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Percy visual snapshots', () => {
  test('home', async ({ page }): Promise<void> => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await percySnapshot(page, 'Home — Election Process Assistant');
  });
});
