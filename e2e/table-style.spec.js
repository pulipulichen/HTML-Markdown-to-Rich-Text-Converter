import { test, expect } from '@playwright/test';

const TABLE_MARKDOWN = [
  '| Name | Value |',
  '| --- | --- |',
  '| Alpha | 1 |',
  '| Beta | 2 |'
].join('\n');

test('applies selected table style to preview table', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const previewTable = page.locator('#preview-area table').first();

  await input.fill(TABLE_MARKDOWN);
  await expect(previewTable).toHaveAttribute('bordercolor', '#B8C0C8');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#table-style').selectOption('blue');
  await page.locator('#sop-settings-close-btn').click();

  await expect(previewTable).toHaveAttribute('bordercolor', '#B9C9D6');
  await expect(previewTable).toHaveAttribute('cellpadding', '0');
  await expect(previewTable.locator('td, th').first()).toHaveCSS('padding', '2px 6px');
  await expect(previewTable.locator('tr').nth(0)).toHaveAttribute('bgcolor', '#244E73');
  await expect(previewTable.locator('tr').nth(2)).toHaveAttribute('bgcolor', '#E8F0F6');
});

test('persists selected table style after reload', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const previewTable = page.locator('#preview-area table').first();

  await page.locator('#sop-settings-btn').click();
  await page.locator('#table-style').selectOption('yellow');
  await page.locator('#sop-settings-close-btn').click();

  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('table_style')))
    .toBe('yellow');

  await page.reload();
  await input.fill(TABLE_MARKDOWN);

  await page.locator('#sop-settings-btn').click();
  await expect(page.locator('#table-style')).toHaveValue('yellow');
  await page.locator('#sop-settings-close-btn').click();

  await expect(previewTable).toHaveAttribute('bordercolor', '#D2BE8B');
  await expect(previewTable.locator('tr').nth(0)).toHaveAttribute('bgcolor', '#8A631D');
});
