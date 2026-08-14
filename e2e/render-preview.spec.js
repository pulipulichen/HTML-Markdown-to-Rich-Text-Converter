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

test('converts br-separated bullets inside table cells into lists for SOP format', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');
  const markdown = [
    '| 階段 | PVE原生做法 | ES做法 |',
    '| --- | --- | --- |',
    '| 1. 蒐集資訊 | 需自行建構蒐集資訊方法<br> | 用 hw_inventory.iso 調查 |',
    '| 2. 設定資訊 | 各別設定<br>- ISO Builder：指令設定<br>- Answer Server：PDM設定<br>無進階設定 | - ISO Builder：內涵基本安裝和進階設定資訊，統一用CSV設定 |'
  ].join('\n');

  await input.fill(markdown);

  const mixedCell = preview.locator('table tr').nth(2).locator('td, th').nth(1);
  await expect(mixedCell.locator('ul')).toHaveCount(1);
  await expect(mixedCell.locator('li')).toHaveCount(2);
  await expect(mixedCell.locator('li').nth(0)).toHaveText('ISO Builder：指令設定');
  await expect(mixedCell.locator('li').nth(1)).toHaveText('Answer Server：PDM設定');
  await expect(mixedCell).toContainText('各別設定');
  await expect(mixedCell).toContainText('無進階設定');

  const hasExtraBreakAroundList = await mixedCell.evaluate(cell => {
    const ul = cell.querySelector('ul');
    if (!ul) {
      return true;
    }

    const prevIsBr = ul.previousSibling?.nodeName === 'BR';
    const nextIsBr = ul.nextSibling?.nodeName === 'BR';
    return prevIsBr || nextIsBr;
  });
  expect(hasExtraBreakAroundList).toBe(false);

  const singleBulletCell = preview.locator('table tr').nth(2).locator('td, th').nth(2);
  await expect(singleBulletCell.locator('ul')).toHaveCount(1);
  await expect(singleBulletCell.locator('li')).toHaveCount(1);
  await expect(singleBulletCell.locator('li')).toHaveText('ISO Builder：內涵基本安裝和進階設定資訊，統一用CSV設定');
});

test('drops fully empty trailing rows and columns from tables', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');
  const markdown = [
    '| 角色 | PVE原生做法 | ES做法 | |',
    '| --- | --- | --- | --- |',
    '| 待安裝主機 | 必備 | | |',
    '| ISO Builder | PVE套件指令 | | |',
    '| PXE Server | 可選，或用PVE交付 | | |',
    '| Answer Server | PDM | ISO內含，可省略 | |',
    '| First-boot<br>Answer Server | 無 | ISO內含，可省略 | |',
    '| | | | |'
  ].join('\n');

  await input.fill(markdown);

  const table = preview.locator('table').first();
  // Header + 5 body rows; empty trailing row removed.
  await expect(table.locator('tr')).toHaveCount(6);
  // Empty trailing column removed; header keeps 3 labeled columns.
  await expect(table.locator('tr').nth(0).locator('td, th')).toHaveCount(3);
  await expect(table.locator('tr').nth(0).locator('td, th').nth(2)).toHaveText('ES做法');
  await expect(table.locator('tr').nth(5)).toContainText('ISO內含，可省略');
});

test('merges trailing empty non-first cells with colspan in body rows', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');
  const markdown = [
    '| 角色 | PVE原生做法 | ES做法 |',
    '| --- | --- | --- |',
    '| 待安裝主機 | 必備 | |',
    '| ISO Builder | PVE套件指令 | |',
    '| PXE Server | 可選，或用PVE交付 | |',
    '| Answer Server | PDM | ISO內含 |',
    '| First-boot<br>Answer Server | 無 | ISO內含 |'
  ].join('\n');

  await input.fill(markdown);

  const table = preview.locator('table').first();
  const mergedRow = table.locator('tr').nth(1);
  await expect(mergedRow.locator('td, th')).toHaveCount(2);
  await expect(mergedRow.locator('td, th').nth(1)).toHaveAttribute('colspan', '2');
  await expect(mergedRow.locator('td, th').nth(1)).toHaveText('必備');

  await expect(table.locator('tr').nth(2).locator('td, th').nth(1)).toHaveAttribute('colspan', '2');
  await expect(table.locator('tr').nth(3).locator('td, th').nth(1)).toHaveAttribute('colspan', '2');

  const unmergedRow = table.locator('tr').nth(4);
  await expect(unmergedRow.locator('td, th')).toHaveCount(3);
  await expect(unmergedRow.locator('td, th').nth(1)).not.toHaveAttribute('colspan');
  await expect(unmergedRow.locator('td, th').nth(1)).toHaveText('PDM');
  await expect(unmergedRow.locator('td, th').nth(2)).toHaveText('ISO內含');
});

test('converts asterisk bullets inside table cells into lists', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');
  const markdown = [
    '| Name | Notes |',
    '| --- | --- |',
    '| Alpha | Intro<br>* First item<br>* Second item |'
  ].join('\n');

  await input.fill(markdown);

  const cell = preview.locator('table tr').nth(1).locator('td, th').nth(1);
  await expect(cell.locator('ul')).toHaveCount(1);
  await expect(cell.locator('li')).toHaveCount(2);
  await expect(cell.locator('li').nth(0)).toHaveText('First item');
  await expect(cell.locator('li').nth(1)).toHaveText('Second item');
  await expect(cell).toContainText('Intro');
});
