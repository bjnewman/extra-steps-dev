import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('index page has no critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(
    critical,
    `Critical a11y violations: ${critical.map((v) => v.description).join(', ')}`,
  ).toHaveLength(0);
});

test('term detail page has no critical accessibility violations', async ({ page }) => {
  await page.goto('/terms/mcp/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(
    critical,
    `Critical a11y violations: ${critical.map((v) => v.description).join(', ')}`,
  ).toHaveLength(0);
});
