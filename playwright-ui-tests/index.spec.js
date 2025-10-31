import { test, expect } from '@playwright/test';

test.describe('index.html smoke test', () => {
  test('loads without console warnings or errors', async ({ page }) => {
    const consoleIssues = [];
    const pageErrors = [];
    const allowedWarningPatterns = [
      /cdn\.tailwindcss\.com should not be used in production/i,
    ];

    page.on('console', (message) => {
      const type = message.type();
      const text = message.text();

      if (type === 'error') {
        consoleIssues.push({ type, text });
      } else if (type === 'warning') {
        const isAllowed = allowedWarningPatterns.some((pattern) =>
          pattern.test(text)
        );

        if (!isAllowed) {
          consoleIssues.push({ type, text });
        }
      }
    });

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    const response = await page.goto('/');

    await expect(response, 'Expected to receive a valid response when loading /').not.toBeNull();

    if (response) {
      expect.soft(
        response.status(),
        `Expected a successful status code for index.html but received ${response.status()} ${response.statusText()}`
      ).toBeLessThan(400);
    }

    // Prefer networkidle so the check works for any static page; fall back to load if idle never fires.
    try {
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      await page.waitForLoadState('load');
    }

    expect(consoleIssues, 'Console warning/error detected while loading index.html').toEqual([]);
    expect(pageErrors, 'Unhandled page errors detected while loading index.html').toEqual([]);
  });
});
