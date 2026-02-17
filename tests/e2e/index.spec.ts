import { expect, test } from '@playwright/test';

test('index page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/extra-steps/i);
});

test('term rows are visible', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('details.term-row');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(0);
});

test('search filters terms', async ({ page }) => {
  await page.goto('/');
  const allRows = page.locator('.terms-list__item');
  const totalBefore = await allRows.count();

  await page.locator('#search-input').fill('mcp');
  // Give the client-side filter a tick
  await page.waitForTimeout(100);

  const visibleAfter = await page
    .locator('.terms-list__item')
    .filter({ hasNot: page.locator('[hidden]') })
    .count();

  expect(visibleAfter).toBeLessThan(totalBefore);
  expect(visibleAfter).toBeGreaterThan(0);
});

test('accordion row expands on click', async ({ page }) => {
  await page.goto('/');
  const firstRow = page.locator('details.term-row').first();
  await expect(firstRow).not.toHaveAttribute('open');
  await firstRow.locator('summary').click();
  await expect(firstRow).toHaveAttribute('open', '');
});

test('accordion row links to detail page', async ({ page }) => {
  await page.goto('/');
  const firstRow = page.locator('details.term-row').first();
  await firstRow.locator('summary').click();
  const link = firstRow.locator('a[href^="/terms/"]');
  await expect(link).toBeVisible();
});

test('term detail page renders', async ({ page }) => {
  await page.goto('/terms/mcp/');
  await expect(page.locator('.detail-hero__term')).toContainText('MCP');
  await expect(page.locator('.detail-hero__primitive').first()).toBeVisible();
  await expect(page.locator('.detail-tldr')).toBeVisible();
});

test('term detail page has required sections', async ({ page }) => {
  await page.goto('/terms/mcp/');
  const headings = await page.locator('.prose h2').allTextContents();
  expect(headings).toContain('What they say');
  expect(headings).toContain('What it actually is');
});

test('back link on detail page navigates home', async ({ page }) => {
  await page.goto('/terms/mcp/');
  await page.locator('a[href="/"]').first().click();
  await expect(page).toHaveURL('/');
});
