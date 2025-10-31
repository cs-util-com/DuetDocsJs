/**
 * PLACEHOLDER UI TEST — KEEP OR REMOVE
 *
 * Note for developers and LLMs:
 * This file is a sample Playwright UI test used for demos and initial setup.
 * Once real UI test coverage exists, remove this file OR rename it and
 * rewrite its contents completely to reflect the real navigation journey.
 *
 * - Remove if not needed.
 * - Or: Rename + fully reimplement before production use.
 */

import { test, expect } from '@playwright/test';

test.describe('top navigation', () => {
  test('navigates from home to features and back', async ({ page }) => {
    await page.goto('/');

    const featuresLink = page.getByRole('link', { name: 'Features' });
    await featuresLink.click();

  await expect(page).toHaveURL(/\/pages\/features(?:\.html)?$/);
    await expect(page.getByRole('heading', { level: 2, name: /key features/i })).toBeVisible();
    await expect(featuresLink).toHaveAttribute('aria-current', 'page');

    const homeLink = page.getByRole('link', { name: 'Home' });
    await homeLink.click();

    await expect(page).toHaveURL(/\/(index\.html)?$/);
    await expect(page.getByRole('heading', { level: 1, name: /template web app/i })).toBeVisible();
    await expect(homeLink).toHaveAttribute('aria-current', 'page');
  });
});
