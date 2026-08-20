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

test('renders nested indented lists correctly in preview', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');
  const markdown = [
    '- 漢神目前共有三處主要環境：',
    '  - **高雄 2 家店**：現行使用 VMware。',
    '  - **臺中 1 家店**：現行使用 Bigstack。',
    '  - **巨蛋店**：目前為 VMware 三層式 Storage 架構，規劃未來轉為 **PVE 超融合架構**。'
  ].join('\n');

  await input.fill(markdown);

  const topUl = preview.locator('> ul');
  await expect(topUl).toHaveCount(1);

  const topLi = topUl.locator('> li');
  await expect(topLi).toHaveCount(1);
  await expect(topLi).toContainText('漢神目前共有三處主要環境：');

  const nestedUl = topLi.locator('> ul');
  await expect(nestedUl).toHaveCount(1);

  const nestedLis = nestedUl.locator('> li');
  await expect(nestedLis).toHaveCount(3);
  await expect(nestedLis.nth(0)).toContainText('高雄 2 家店');
  await expect(nestedLis.nth(0).locator('strong')).toHaveText('高雄 2 家店');
  await expect(nestedLis.nth(1)).toContainText('臺中 1 家店');
  await expect(nestedLis.nth(1).locator('strong')).toHaveText('臺中 1 家店');
  await expect(nestedLis.nth(2)).toContainText('巨蛋店');
  await expect(nestedLis.nth(2).locator('strong').nth(0)).toHaveText('巨蛋店');
  await expect(nestedLis.nth(2).locator('strong').nth(1)).toHaveText('PVE 超融合架構');
});

test('nests list items indented by a single space', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');
  const markdown = [
    '## 一、漢神現況與 PVE 導入需求',
    '',
    '- 漢神目前共有三處主要環境：',
    ' ',
    ' - **高雄 2 家店**：現行使用 VMware。',
    ' ',
    ' - **臺中 1 家店**：現行使用 Bigstack。',
    ' ',
    ' - **巨蛋店**：目前為 VMware 三層式 Storage 架構，規劃未來轉為 **PVE 超融合架構**。',
    ' ',
    '- 預計 2028 年開新店。'
  ].join('\n');

  await input.fill(markdown);

  const topLis = preview.locator('> ul > li');
  await expect(topLis).toHaveCount(2);
  await expect(topLis.nth(0)).toContainText('漢神目前共有三處主要環境：');
  await expect(topLis.nth(1)).toContainText('預計 2028 年開新店。');

  const nestedLis = topLis.nth(0).locator('> ul > li');
  await expect(nestedLis).toHaveCount(3);
  await expect(nestedLis.nth(0).locator('strong')).toHaveText('高雄 2 家店');
  await expect(nestedLis.nth(1).locator('strong')).toHaveText('臺中 1 家店');
  await expect(nestedLis.nth(2).locator('strong').nth(0)).toHaveText('巨蛋店');
});

test('keeps sibling list items flat when indentation is uniform', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('- Alpha\n- Beta\n- Gamma');

  await expect(preview.locator('> ul > li')).toHaveCount(3);
  await expect(preview.locator('> ul > li ul')).toHaveCount(0);
});

test('nests ordered list items indented by a single space', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('1. 第一階段\n 1. 子項目 A\n 2. 子項目 B\n2. 第二階段');

  const topLis = preview.locator('> ol > li');
  await expect(topLis).toHaveCount(2);

  const nestedLis = topLis.nth(0).locator('> ol > li');
  await expect(nestedLis).toHaveCount(2);
  await expect(nestedLis.nth(0)).toContainText('子項目 A');
  await expect(nestedLis.nth(1)).toContainText('子項目 B');
});

test('removes blank lines between list items to keep the list tight', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');
  const markdown = [
    '- 漢神目前共有三處主要環境：',
    ' ',
    ' - **高雄 2 家店**：現行使用 VMware。',
    ' ',
    ' - **臺中 1 家店**：現行使用 Bigstack。',
    ' ',
    '- 預計 2028 年開新店。'
  ].join('\n');

  await input.fill(markdown);

  // A tight list must not wrap its items in <p>.
  await expect(preview.locator('li p')).toHaveCount(0);

  const topLis = preview.locator('> ul > li');
  await expect(topLis).toHaveCount(2);
  await expect(topLis.nth(0).locator('> ul > li')).toHaveCount(2);
});

test('keeps blank lines separating a list from surrounding paragraphs', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('Before paragraph.\n\n- Alpha\n\n- Beta\n\nAfter paragraph.');

  // The list stays tight...
  await expect(preview.locator('li p')).toHaveCount(0);
  await expect(preview.locator('> ul > li')).toHaveCount(2);

  // ...but the surrounding paragraphs are still separate blocks.
  await expect(preview.locator('> p')).toHaveCount(2);
  await expect(preview.locator('> p').nth(0)).toHaveText('Before paragraph.');
  await expect(preview.locator('> p').nth(1)).toHaveText('After paragraph.');
});

test('keeps two lists separate when a paragraph splits them', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('- Alpha\n\n- Beta\n\nMiddle text.\n\n- Gamma\n\n- Delta');

  await expect(preview.locator('> ul')).toHaveCount(2);
  await expect(preview.locator('> ul').nth(0).locator('> li')).toHaveCount(2);
  await expect(preview.locator('> ul').nth(1).locator('> li')).toHaveCount(2);
  await expect(preview.locator('> p')).toHaveText(['Middle text.']);
});

test('keeps blank lines between plain paragraphs', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('Para one.\n\nPara two.\n\nPara three.');

  await expect(preview.locator('> p')).toHaveCount(3);
});

test('does not reindent list-like lines inside fenced code blocks', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('```\n- parent\n - child\n```');

  // Fenced code must never be turned into a real list.
  await expect(preview.locator('ul')).toHaveCount(0);
  await expect(preview.locator('li')).toHaveCount(0);

  // The original single-space indent inside the fence stays untouched.
  const codeText = await preview.evaluate(el => el.textContent.replace(/\u00a0/g, ' '));
  expect(codeText).toContain('- parent');
  expect(codeText).toContain(' - child');
});

