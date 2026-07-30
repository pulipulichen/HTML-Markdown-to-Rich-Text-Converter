import { test, expect } from '@playwright/test';

const TABLE_MARKDOWN = [
  '| Name | Value | Extra |',
  '| --- | --- | --- |',
  '| Alpha | 1 | A |',
  '| Beta | 2 | B |',
  '| Gamma | 3 | C |'
].join('\n');

async function selectSlideFormat(page) {
  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('slide-16-9');
  await page.locator('#sop-settings-close-btn').click();
}

test('applies slide table width, zebra striping, padding, and centered headers', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const previewTable = page.locator('#preview-area table').first();

  await selectSlideFormat(page);
  await input.fill(TABLE_MARKDOWN);

  await expect(previewTable).toHaveAttribute('width', '960');
  await expect(previewTable).toHaveAttribute('data-slide-table', 'true');
  await expect(previewTable).toHaveAttribute('data-slide-table-width', 'full');
  await expect(previewTable).toHaveAttribute('style', /width:\s*960px/);
  await expect(previewTable).toHaveAttribute('bordercolor', '#B8C0C8');

  const headerRow = previewTable.locator('tr').nth(0);
  await expect(headerRow).toHaveAttribute('bgcolor', '#465362');
  await expect(headerRow.locator('td, th').nth(0)).toHaveAttribute('align', 'center');
  await expect(headerRow.locator('td, th').nth(0)).toHaveAttribute('valign', 'middle');
  await expect(headerRow.locator('td, th').nth(1)).toHaveAttribute('align', 'center');
  await expect(headerRow.locator('td, th').nth(1)).toHaveAttribute('valign', 'middle');
  await expect(headerRow.locator('td, th').nth(1)).toHaveCSS('padding', '2px');

  await expect(previewTable.locator('tr').nth(1)).toHaveAttribute('bgcolor', '#FAFBFC');
  await expect(previewTable.locator('tr').nth(2)).toHaveAttribute('bgcolor', '#E9EDF1');
  await expect(previewTable.locator('tr').nth(3)).toHaveAttribute('bgcolor', '#FAFBFC');

  const bodyCell = previewTable.locator('tr').nth(1).locator('td, th').nth(1);
  await expect(bodyCell).toHaveAttribute('align', 'center');
  await expect(bodyCell).toHaveAttribute('valign', 'middle');
  await expect(bodyCell).toHaveCSS('text-align', 'center');
  await expect(bodyCell).toHaveCSS('vertical-align', 'middle');

  const firstColumnBodyCell = previewTable.locator('tr').nth(1).locator('td, th').nth(0);
  await expect(firstColumnBodyCell).toHaveAttribute('bgcolor', '#465362');
  await expect(firstColumnBodyCell).toHaveAttribute('align', 'center');
  await expect(firstColumnBodyCell).toHaveAttribute('valign', 'middle');
  await expect(firstColumnBodyCell).toHaveCSS('white-space', 'nowrap');
  // Default table font 18 → extra padding = 0.5*18pt = 9pt
  await expect(firstColumnBodyCell).toHaveAttribute('style', /white-space:\s*nowrap/);
  await expect(firstColumnBodyCell).toHaveAttribute('style', /padding:\s*2px\s+calc\(2px \+ 9pt\)/);
  await expect(headerRow.locator('td, th').nth(1)).toHaveAttribute(
    'style',
    /padding:\s*calc\(2px \+ 9pt\)\s+2px/
  );
  // Corner header cell gets both vertical and horizontal extra padding
  await expect(headerRow.locator('td, th').nth(0)).toHaveAttribute(
    'style',
    /padding:\s*calc\(2px \+ 9pt\)\s+calc\(2px \+ 9pt\)/
  );
});

test('converts br-separated bullets in slide table cells into left-aligned lists', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const previewTable = page.locator('#preview-area table').first();
  const listMarkdown = [
    '| Task | 主要成果 |',
    '| --- | --- |',
    '| Task 10 | - 使用 POM 完成離線授權與 Patch Upgrade<br>- 驗證無網際網路環境更新流程 |'
  ].join('\n');

  await selectSlideFormat(page);
  await input.fill(listMarkdown);

  const listCell = previewTable.locator('tr').nth(1).locator('td, th').nth(1);
  await expect(listCell).toHaveAttribute('align', 'left');
  await expect(listCell).toHaveCSS('text-align', 'left');
  await expect(listCell.locator('ul')).toHaveCount(1);
  await expect(listCell.locator('li')).toHaveCount(2);
  await expect(listCell.locator('li').nth(0)).toHaveText('使用 POM 完成離線授權與 Patch Upgrade');
  await expect(listCell.locator('li').nth(1)).toHaveText('驗證無網際網路環境更新流程');
  await expect(listCell.locator('li').nth(0)).toHaveAttribute('style', /margin-top:\s*9pt/);
  await expect(listCell.locator('li').nth(0)).toHaveAttribute('style', /margin-bottom:\s*9pt/);
});

test('applies slide table width full and half options', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const previewTable = page.locator('#preview-area table').first();

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('slide-16-9');
  await expect(page.locator('#slide-table-width')).toHaveValue('full');
  await page.locator('#sop-settings-close-btn').click();

  await input.fill(TABLE_MARKDOWN);
  await expect(previewTable).toHaveAttribute('width', '960');
  await expect(previewTable).toHaveAttribute('data-slide-table-width', 'full');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#slide-table-width').selectOption('half');
  await page.locator('#sop-settings-close-btn').click();

  await expect(previewTable).toHaveAttribute('width', '450');
  await expect(previewTable).toHaveAttribute('data-slide-table-width', 'half');
  await expect(previewTable).toHaveAttribute('style', /width:\s*450px/);
});

test('applies slide table height full, half, and auto options', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const previewTable = page.locator('#preview-area table').first();

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('slide-16-9');
  await expect(page.locator('#slide-table-height')).toHaveValue('full');
  await page.locator('#sop-settings-close-btn').click();

  await input.fill(TABLE_MARKDOWN);
  await expect(previewTable).toHaveAttribute('height', '420');
  await expect(previewTable).toHaveAttribute('data-slide-table-height', 'full');
  await expect(previewTable).toHaveAttribute('style', /height:\s*420px/);
  // Default font size 18 → header row height = 18 * 1.5 = 27
  await expect(previewTable.locator('tr').nth(0)).toHaveAttribute('height', '27');
  await expect(previewTable.locator('tr').nth(1)).toHaveAttribute('height', '131');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#slide-table-height').selectOption('half');
  await page.locator('#sop-settings-close-btn').click();

  await expect(previewTable).toHaveAttribute('height', '210');
  await expect(previewTable).toHaveAttribute('data-slide-table-height', 'half');
  await expect(previewTable).toHaveAttribute('style', /height:\s*210px/);
  await expect(previewTable.locator('tr').nth(0)).toHaveAttribute('height', '27');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#slide-table-height').selectOption('auto');
  await page.locator('#sop-settings-close-btn').click();

  await expect(previewTable).toHaveAttribute('data-slide-table-height', 'auto');
  await expect(previewTable).not.toHaveAttribute('height');
  await expect(previewTable).not.toHaveAttribute('style', /height:\s*\d+px/);
});

test('applies slide header type primary and secondary colors', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const previewTable = page.locator('#preview-area table').first();

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('slide-16-9');
  await page.locator('#slide-header-type').selectOption('column-primary');
  await page.locator('#sop-settings-close-btn').click();

  await input.fill(TABLE_MARKDOWN);

  const firstRowFirstCell = previewTable.locator('tr').nth(0).locator('td, th').nth(0);
  const firstRowSecondCell = previewTable.locator('tr').nth(0).locator('td, th').nth(1);
  const secondRowFirstCell = previewTable.locator('tr').nth(1).locator('td, th').nth(0);
  const secondRowSecondCell = previewTable.locator('tr').nth(1).locator('td, th').nth(1);

  await expect(firstRowFirstCell).toHaveAttribute('bgcolor', '#465362');
  await expect(firstRowSecondCell).toHaveAttribute('bgcolor', '#687586');
  await expect(firstRowSecondCell).toHaveAttribute('align', 'center');
  await expect(secondRowFirstCell).toHaveAttribute('bgcolor', '#465362');
  await expect(secondRowFirstCell).toHaveAttribute('align', 'center');
  await expect(secondRowSecondCell).toHaveAttribute('bgcolor', '#FAFBFC');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#slide-header-type').selectOption('row-primary');
  await page.locator('#sop-settings-close-btn').click();

  await expect(previewTable.locator('tr').nth(0).locator('td, th').nth(1)).toHaveAttribute('bgcolor', '#465362');
  await expect(previewTable.locator('tr').nth(1).locator('td, th').nth(0)).toHaveAttribute('bgcolor', '#687586');
  await expect(previewTable.locator('tr').nth(1).locator('td, th').nth(0)).toHaveAttribute('align', 'center');
});

test('resets body font size to 12pt when switching from slide back to SOP', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('Hello paragraph.\n\n- List item');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('slide-16-9');
  await page.locator('#slide-text-font-size').selectOption('22');
  await page.locator('#sop-settings-close-btn').click();

  await expect(preview).toHaveAttribute('style', /font-size:\s*22pt/);
  await expect(preview.locator('p').first()).toHaveAttribute('style', /font-size:\s*22pt/);

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('sop');
  await page.locator('#sop-settings-close-btn').click();

  await expect(preview).toHaveAttribute('style', /font-size:\s*12pt/);
  await expect(preview.locator('p').first()).not.toHaveAttribute('style', /font-size:\s*22pt/);
});

test('applies slide line height and separate table/text font sizes', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('slide-16-9');
  await expect(page.locator('#slide-line-height')).toHaveValue('1.15');
  await expect(page.locator('#slide-table-font-size')).toHaveValue('18');
  await expect(page.locator('#slide-text-font-size')).toHaveValue('20');

  await page.locator('#slide-line-height').selectOption('1.5');
  await page.locator('#slide-table-font-size').selectOption('16');
  await page.locator('#slide-text-font-size').selectOption('22');
  await page.locator('#sop-settings-close-btn').click();

  await input.fill('# Title\n\nHello paragraph.\n\n- List item\n\n| A | B |\n| --- | --- |\n| 1 | 2 |');

  await expect(preview.locator('p').first()).toHaveAttribute('style', /line-height:\s*1\.5/);
  await expect(preview.locator('p').first()).toHaveAttribute('style', /font-size:\s*22pt/);
  await expect(preview.locator('li').first()).toHaveAttribute('style', /font-size:\s*22pt/);
  await expect(preview.locator('li').first()).toHaveAttribute('style', /margin-bottom:\s*11pt/);
  await expect(preview.locator('table font').first()).toHaveAttribute('style', /font-size:\s*16pt/);
});

test('applies table colors to non-table text and bold emphasis when enabled', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('slide-16-9');
  await page.locator('#slide-apply-table-colors-to-text').check();
  await page.locator('#sop-settings-close-btn').click();

  await input.fill('Normal text with **bold text**.\n\n- List **item**');

  const paragraphFont = preview.locator('p font[data-slide-body-text="true"]').first();
  await expect(paragraphFont).toHaveAttribute('color', '#27313B');
  await expect(preview.locator('p strong font[data-slide-emphasis="true"]').first()).toHaveAttribute('color', '#465362');
  await expect(preview.locator('li strong font[data-slide-emphasis="true"]').first()).toHaveAttribute('color', '#465362');
});

test('keeps slide format and slide settings after reload', async ({ page }) => {
  await page.goto('/');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('slide-16-9');
  await page.locator('#slide-header-type').selectOption('row-primary');
  await page.locator('#slide-table-font-size').selectOption('16');
  await page.locator('#slide-text-font-size').selectOption('22');
  await page.locator('#slide-apply-table-colors-to-text').check();
  await page.locator('#slide-line-height').selectOption('1');
  await page.locator('#slide-table-width').selectOption('half');
  await page.locator('#slide-table-height').selectOption('auto');
  await page.locator('#sop-settings-close-btn').click();

  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('rich_text_format')))
    .toBe('slide-16-9');
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('slide_header_type')))
    .toBe('row-primary');
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('slide_table_font_size')))
    .toBe('16');
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('slide_text_font_size')))
    .toBe('22');
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('slide_apply_table_colors_to_text')))
    .toBe('true');
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('slide_line_height')))
    .toBe('1');
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('slide_table_width')))
    .toBe('half');
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('slide_table_height')))
    .toBe('auto');

  await page.reload();
  await page.locator('#sop-settings-btn').click();

  await expect(page.locator('#rich-text-format')).toHaveValue('slide-16-9');
  await expect(page.locator('#slide-header-type')).toHaveValue('row-primary');
  await expect(page.locator('#slide-table-font-size')).toHaveValue('16');
  await expect(page.locator('#slide-text-font-size')).toHaveValue('22');
  await expect(page.locator('#slide-apply-table-colors-to-text')).toBeChecked();
  await expect(page.locator('#slide-line-height')).toHaveValue('1');
  await expect(page.locator('#slide-table-width')).toHaveValue('half');
  await expect(page.locator('#slide-table-height')).toHaveValue('auto');
  await expect(page.locator('#render-settings-slide-section')).not.toHaveClass(/hidden/);
  await expect(page.locator('#render-settings-document-section')).toHaveClass(/hidden/);
});
