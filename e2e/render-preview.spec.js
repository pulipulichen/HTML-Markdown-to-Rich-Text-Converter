import { test, expect } from '@playwright/test';

test('renders markdown headings and paragraphs in preview', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('# Hello World\n\nThis is a preview test.');

  await expect(preview.locator('h2')).toHaveText('Hello World');
  await expect(preview.locator('p')).toHaveText('This is a preview test.');
});

test('inserts a blank line after tables in preview', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('| Name | Value |\n| --- | --- |\n| Alpha | 1 |\n\nNext paragraph.');

  const table = preview.locator('table').first();
  await expect(table).toBeVisible();

  const hasTrailingBreak = await table.evaluate(el => el.nextElementSibling?.tagName === 'BR');
  expect(hasTrailingBreak).toBe(true);
});

test('skips blank line after tables when setting is disabled', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await page.locator('#sop-settings-btn').click();
  await expect(page.locator('#blank-line-after-tables')).toBeChecked();
  await page.locator('#blank-line-after-tables').uncheck();
  await page.locator('#sop-settings-close-btn').click();

  await input.fill('| Name | Value |\n| --- | --- |\n| Alpha | 1 |\n\nNext paragraph.');

  const table = preview.locator('table').first();
  const hasTrailingBreak = await table.evaluate(el => el.nextElementSibling?.tagName === 'BR');
  expect(hasTrailingBreak).toBe(false);
});

test('keeps blank-line-after-tables selection after reload', async ({ page }) => {
  await page.goto('/');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#blank-line-after-tables').uncheck();
  await page.locator('#sop-settings-close-btn').click();

  await page.reload();
  await page.locator('#sop-settings-btn').click();

  await expect(page.locator('#blank-line-after-tables')).not.toBeChecked();
});

test('normalizes heading levels based on selected top level', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#top-heading-level').selectOption('3');
  await page.locator('#sop-settings-close-btn').click();

  await input.fill('# Main Title\n\n## Sub Title');

  await expect(preview.locator('h3')).toHaveText('Main Title');
  await expect(preview.locator('h4')).toHaveText('Sub Title');
});

test('renders bold when closing ** follows punctuation then CJK text', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('- **無 VLAN（untagged）**範例：');

  await expect(preview.locator('strong')).toHaveText('無 VLAN（untagged）');
  await expect(preview.locator('li')).toContainText('範例：');
});

test('renders bold when opening ** has a leading space inside the markers', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('1. ** PVE 基礎環境建置**：於十二臺\n2. **PVE Cluster 與共享儲存整合 **：建立多節點');

  await expect(preview.locator('strong').nth(0)).toHaveText('PVE 基礎環境建置');
  await expect(preview.locator('strong').nth(1)).toHaveText('PVE Cluster 與共享儲存整合');
  await expect(preview.locator('li').nth(0)).not.toContainText('**');
  await expect(preview.locator('li').nth(1)).not.toContainText('**');
});

test('renders bold when colon is inside ** and followed by CJK text', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('1. **PVE 基礎環境建置：**於十二臺');

  await expect(preview.locator('strong')).toHaveText('PVE 基礎環境建置：');
  await expect(preview.locator('li')).toContainText('於十二臺');
  await expect(preview.locator('li')).not.toContainText('**');
});
