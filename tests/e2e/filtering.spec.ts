import { expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Count visible (non-hidden) term rows */
async function visibleRows(page: import('@playwright/test').Page) {
  return page.locator('.terms-list__item:not([hidden])').count();
}

/** Get the displayed result count text */
async function resultCount(page: import('@playwright/test').Page) {
  return page.locator('#result-count').textContent();
}

// ---------------------------------------------------------------------------
// Category select filtering
// ---------------------------------------------------------------------------

test.describe('category select', () => {
  test('filters rows to selected category', async ({ page }) => {
    await page.goto('/');
    const totalBefore = await visibleRows(page);

    await page.locator('#filter-category').selectOption('patterns');
    await page.waitForTimeout(50);

    const after = await visibleRows(page);
    expect(after).toBeLessThan(totalBefore);
    expect(after).toBe(7); // 7 pattern terms

    // Every visible row should have data-category="patterns"
    const categories = await page
      .locator('.terms-list__item:not([hidden])')
      .evaluateAll((els) => els.map((el) => el.dataset.category));
    expect(categories.every((c) => c === 'patterns')).toBe(true);
  });

  test('result count updates when filtered', async ({ page }) => {
    await page.goto('/');
    expect(await resultCount(page)).toBe('14');

    await page.locator('#filter-category').selectOption('historical');
    await page.waitForTimeout(50);

    expect(await resultCount(page)).toBe('4');
  });

  test('resetting to empty value shows all rows', async ({ page }) => {
    await page.goto('/');
    await page.locator('#filter-category').selectOption('data');
    await page.waitForTimeout(50);
    expect(await visibleRows(page)).toBe(2);

    await page.locator('#filter-category').selectOption('');
    await page.waitForTimeout(50);
    expect(await visibleRows(page)).toBe(14);
  });

  test('select gets is-active class when filtered', async ({ page }) => {
    await page.goto('/');
    const select = page.locator('#filter-category');
    await expect(select).not.toHaveClass(/is-active/);

    await select.selectOption('protocols');
    await page.waitForTimeout(50);
    await expect(select).toHaveClass(/is-active/);
  });
});

// ---------------------------------------------------------------------------
// Category badge click
// ---------------------------------------------------------------------------

test.describe('category badge click', () => {
  test('filters table to the clicked category', async ({ page }) => {
    await page.goto('/');

    // Click the first badge (which is inside a <summary>)
    const firstBadge = page.locator('[data-filter-category]').first();
    const category = (await firstBadge.textContent())?.trim();
    await firstBadge.click();
    await page.waitForTimeout(50);

    // Verify select synced
    const selectValue = await page.locator('#filter-category').inputValue();
    expect(selectValue).toBe(category);

    // All visible rows should match
    const categories = await page
      .locator('.terms-list__item:not([hidden])')
      .evaluateAll((els) => els.map((el) => el.dataset.category));
    expect(categories.every((c) => c === category)).toBe(true);
  });

  test('does NOT toggle the accordion', async ({ page }) => {
    await page.goto('/');
    const firstRow = page.locator('details.term-row').first();

    // Ensure accordion is closed
    await expect(firstRow).not.toHaveAttribute('open');

    // Click the badge inside the summary
    await firstRow.locator('[data-filter-category]').click();
    await page.waitForTimeout(50);

    // Accordion should still be closed
    await expect(firstRow).not.toHaveAttribute('open');
  });

  test('clicking same category badge again clears the filter', async ({ page }) => {
    await page.goto('/');
    const totalBefore = await visibleRows(page);
    const firstBadge = page.locator('[data-filter-category]').first();

    // Click once to filter
    await firstBadge.click();
    await page.waitForTimeout(50);
    const afterFilter = await visibleRows(page);
    expect(afterFilter).toBeLessThan(totalBefore);

    // Click a badge of the same category to clear
    // (the first visible badge will be the same category)
    const sameBadge = page.locator('.terms-list__item:not([hidden]) [data-filter-category]').first();
    await sameBadge.click();
    await page.waitForTimeout(50);

    expect(await visibleRows(page)).toBe(totalBefore);
    expect(await page.locator('#filter-category').inputValue()).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Filter composition (search + category)
// ---------------------------------------------------------------------------

test.describe('filter composition', () => {
  test('search AND category filter combine', async ({ page }) => {
    await page.goto('/');

    // Filter to patterns
    await page.locator('#filter-category').selectOption('patterns');
    await page.waitForTimeout(50);
    const patternsCount = await visibleRows(page);

    // Then search within patterns
    await page.locator('#search-input').fill('rag');
    await page.waitForTimeout(50);

    const combined = await visibleRows(page);
    expect(combined).toBeLessThanOrEqual(patternsCount);
    expect(combined).toBeGreaterThan(0);
  });

  test('clearing search keeps category filter active', async ({ page }) => {
    await page.goto('/');
    await page.locator('#filter-category').selectOption('historical');
    await page.locator('#search-input').fill('docker');
    await page.waitForTimeout(50);

    // Clear search
    await page.locator('#search-input').fill('');
    await page.waitForTimeout(50);

    // Category filter should still be active
    expect(await visibleRows(page)).toBe(4);
    expect(await page.locator('#filter-category').inputValue()).toBe('historical');
  });

  test('empty state shows combined filter context', async ({ page }) => {
    await page.goto('/');
    await page.locator('#filter-category').selectOption('protocols');
    await page.locator('#search-input').fill('xyznonexistent');
    await page.waitForTimeout(50);

    const emptyState = page.locator('#empty-state');
    await expect(emptyState).toBeVisible();

    const queryText = await page.locator('#empty-query').textContent();
    expect(queryText).toContain('xyznonexistent');
    expect(queryText).toContain('protocols');
  });
});

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

test.describe('sorting', () => {
  test('clicking term header sorts alphabetically ascending', async ({ page }) => {
    await page.goto('/');
    const sortBtn = page.locator('[data-sort="title"]');
    await sortBtn.click();
    await page.waitForTimeout(50);

    const titles = await page
      .locator('.terms-list__item:not([hidden])')
      .evaluateAll((els) => els.map((el) => el.dataset.title));

    const sorted = [...titles].sort((a, b) => (a ?? '').localeCompare(b ?? ''));
    expect(titles).toEqual(sorted);
  });

  test('second click sorts descending', async ({ page }) => {
    await page.goto('/');
    const sortBtn = page.locator('[data-sort="title"]');
    await sortBtn.click(); // asc
    await sortBtn.click(); // desc
    await page.waitForTimeout(50);

    const titles = await page
      .locator('.terms-list__item:not([hidden])')
      .evaluateAll((els) => els.map((el) => el.dataset.title));

    const sorted = [...titles].sort((a, b) => (b ?? '').localeCompare(a ?? ''));
    expect(titles).toEqual(sorted);
  });

  test('third click resets to default order', async ({ page }) => {
    await page.goto('/');

    // Capture default order
    const defaultOrder = await page
      .locator('.terms-list__item')
      .evaluateAll((els) => els.map((el) => el.dataset.title));

    const sortBtn = page.locator('[data-sort="title"]');
    await sortBtn.click(); // asc
    await sortBtn.click(); // desc
    await sortBtn.click(); // reset
    await page.waitForTimeout(50);

    const currentOrder = await page
      .locator('.terms-list__item')
      .evaluateAll((els) => els.map((el) => el.dataset.title));

    expect(currentOrder).toEqual(defaultOrder);
  });

  test('aria-sort attribute is set correctly', async ({ page }) => {
    await page.goto('/');
    const sortBtn = page.locator('[data-sort="title"]');

    await expect(sortBtn).not.toHaveAttribute('aria-sort');

    await sortBtn.click();
    await expect(sortBtn).toHaveAttribute('aria-sort', 'ascending');

    await sortBtn.click();
    await expect(sortBtn).toHaveAttribute('aria-sort', 'descending');

    await sortBtn.click();
    await expect(sortBtn).not.toHaveAttribute('aria-sort');
  });

  test('sorting preserves open accordion state', async ({ page }) => {
    await page.goto('/');

    // Open the first accordion and capture its identity
    const firstSummary = page.locator('details.term-row').first().locator('summary');
    const termName = await firstSummary.locator('.term-row__name').textContent();
    await firstSummary.click();

    // Verify it opened
    const openBefore = await page.locator('details.term-row[open]').count();
    expect(openBefore).toBe(1);

    // Sort — this reorders the DOM
    await page.locator('[data-sort="title"]').click();
    await page.waitForTimeout(50);

    // There should still be exactly one open details element
    const openAfter = await page.locator('details.term-row[open]').count();
    expect(openAfter).toBe(1);

    // And it should be the same term we opened
    const openTermName = await page
      .locator('details.term-row[open] .term-row__name')
      .textContent();
    expect(openTermName).toBe(termName);
  });

  test('sorting composes with category filter', async ({ page }) => {
    await page.goto('/');
    await page.locator('#filter-category').selectOption('patterns');
    await page.locator('[data-sort="title"]').click();
    await page.waitForTimeout(50);

    const visible = await page
      .locator('.terms-list__item:not([hidden])')
      .evaluateAll((els) => els.map((el) => el.dataset.title));

    // All visible should be sorted
    const sorted = [...visible].sort((a, b) => (a ?? '').localeCompare(b ?? ''));
    expect(visible).toEqual(sorted);

    // And all should be patterns
    const categories = await page
      .locator('.terms-list__item:not([hidden])')
      .evaluateAll((els) => els.map((el) => el.dataset.category));
    expect(categories.every((c) => c === 'patterns')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// URL state
// ---------------------------------------------------------------------------

test.describe('URL state', () => {
  test('category filter persists in URL', async ({ page }) => {
    await page.goto('/');
    await page.locator('#filter-category').selectOption('historical');
    await page.waitForTimeout(50);

    expect(page.url()).toContain('category=historical');
  });

  test('sort state persists in URL', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-sort="title"]').click();
    await page.waitForTimeout(50);

    expect(page.url()).toContain('sort=title');
    expect(page.url()).toContain('dir=asc');
  });

  test('category param pre-filters on page load', async ({ page }) => {
    await page.goto('/?category=data');
    await page.waitForTimeout(100);

    expect(await visibleRows(page)).toBe(2);
    expect(await page.locator('#filter-category').inputValue()).toBe('data');
  });

  test('sort param pre-sorts on page load', async ({ page }) => {
    await page.goto('/?sort=title&dir=asc');
    await page.waitForTimeout(100);

    const titles = await page
      .locator('.terms-list__item:not([hidden])')
      .evaluateAll((els) => els.map((el) => el.dataset.title));

    const sorted = [...titles].sort((a, b) => (a ?? '').localeCompare(b ?? ''));
    expect(titles).toEqual(sorted);
  });

  test('clearing filter removes URL params', async ({ page }) => {
    await page.goto('/?category=patterns');
    await page.waitForTimeout(100);

    await page.locator('#filter-category').selectOption('');
    await page.waitForTimeout(50);

    expect(page.url()).not.toContain('category=');
  });
});

// ---------------------------------------------------------------------------
// Security: XSS and injection
// ---------------------------------------------------------------------------

test.describe('security', () => {
  test('XSS via category URL param does not execute script', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    await page.goto('/?category=<script>alert(1)</script>');
    await page.waitForTimeout(200);

    expect(alertFired).toBe(false);

    // No script tags should appear in the DOM as rendered HTML
    const scriptInBody = await page.locator('body').evaluate((body) => {
      return body.innerHTML.includes('<script>alert(1)</script>');
    });
    expect(scriptInBody).toBe(false);
  });

  test('XSS via sort URL param does not execute script', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    await page.goto('/?sort=<img/src=x onerror=alert(1)>&dir=asc');
    await page.waitForTimeout(200);

    expect(alertFired).toBe(false);
  });

  test('HTML injection via search input is escaped in empty state', async ({ page }) => {
    await page.goto('/');
    await page.locator('#search-input').fill('<img src=x onerror=alert(1)>');
    await page.waitForTimeout(100);

    // Empty state should be visible (no results match)
    const emptyState = page.locator('#empty-state');
    await expect(emptyState).toBeVisible();

    // The query text should be rendered as text, not HTML
    const emptyQueryEl = page.locator('#empty-query');
    const text = await emptyQueryEl.textContent();
    expect(text).toContain('<img');

    // But no <img> element should exist inside #empty-query
    const imgCount = await emptyQueryEl.locator('img').count();
    expect(imgCount).toBe(0);
  });

  test('invalid category URL param shows zero results safely', async ({ page }) => {
    await page.goto('/?category=doesnotexist');
    await page.waitForTimeout(100);

    // Should show 0 visible rows
    expect(await visibleRows(page)).toBe(0);

    // Page should not error — empty state visible
    const emptyState = page.locator('#empty-state');
    await expect(emptyState).toBeVisible();
  });

  test('prototype pollution via sort param does not crash', async ({ page }) => {
    // __proto__, constructor, toString are common prototype pollution vectors
    const payloads = ['__proto__', 'constructor', 'toString', 'hasOwnProperty'];

    for (const payload of payloads) {
      const response = await page.goto(`/?sort=${payload}&dir=asc`);
      expect(response?.status()).toBe(200);

      // Page should still render without JS errors
      const rows = page.locator('.terms-list__item');
      expect(await rows.count()).toBe(14);
    }
  });

  test('select rejects values not in its options', async ({ page }) => {
    await page.goto('/');

    // Native <select> ignores values that don't match any <option>
    // This is the browser's built-in protection against crafted input
    const valueBefore = await page.locator('#filter-category').inputValue();

    await page.locator('#filter-category').evaluate((el: HTMLSelectElement) => {
      el.value = '"); document.write("pwned';
      el.dispatchEvent(new Event('change'));
    });
    await page.waitForTimeout(100);

    // Select should have rejected the invalid value (reverts to empty/default)
    const valueAfter = await page.locator('#filter-category').inputValue();
    expect(valueAfter).toBe(valueBefore);

    // All rows still visible — the invalid value didn't match any option
    expect(await visibleRows(page)).toBe(14);

    // No injected content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('pwned');
  });
});
