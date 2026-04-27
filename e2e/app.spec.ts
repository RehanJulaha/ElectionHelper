import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Election Process Assistant', () => {
  test('home shows Lok Sabha scope', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Lok Sabha/i)).toBeVisible();
  });
  test('skip link targets main', async ({ page }) => {
    await page.goto('/');
    const skip = page.locator('.skip-link');
    await expect(skip).toHaveAttribute('href', '#main');
  });
  test('timeline has ECI link', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Official sources/i }).click();
    await expect(page.locator('a[href*="eci.gov.in"]').first()).toBeVisible();
  });
  test('glossary navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: /Glossary|शब्दावली/i }).click();
    await expect(page).toHaveURL(/glossary/);
  });
  test('after route change focus moves to main landmark', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: /Glossary|शब्दावली/i }).click();
    await expect(page.locator('#main')).toBeFocused();
  });
  test('language toggle sets html lang', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Hindi|हिंदी/i }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  });
  test('axe home has no serious violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  });
  test('axe glossary', async ({ page }) => {
    await page.goto('/glossary');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter((v) => v.impact === 'critical')).toEqual([]);
  });
});
