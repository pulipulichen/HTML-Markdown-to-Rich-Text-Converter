import { test, expect } from '@playwright/test';

test('opens and closes render settings modal from available controls', async ({ page }) => {
  await page.goto('/');

  const modal = page.locator('#sop-settings-modal');
  const openButton = page.locator('#sop-settings-btn');

  await expect(modal).toHaveClass(/hidden/);

  await openButton.click();
  await expect(modal).not.toHaveClass(/hidden/);

  await page.locator('#sop-settings-close-icon').click();
  await expect(modal).toHaveClass(/hidden/);

  await openButton.click();
  await page.locator('#sop-settings-close-btn').click();
  await expect(modal).toHaveClass(/hidden/);

  await openButton.click();
  await modal.click({ position: { x: 10, y: 10 } });
  await expect(modal).toHaveClass(/hidden/);
});

test('toggles format-specific render settings when rich text format changes', async ({ page }) => {
  await page.goto('/');
  await page.locator('#sop-settings-btn').click();

  const richTextFormat = page.locator('#rich-text-format');
  const tableStyleSection = page.locator('#render-settings-table-style-section');
  const documentSection = page.locator('#render-settings-document-section');
  const extraSection = page.locator('#render-settings-extra-section');
  const slideSection = page.locator('#render-settings-slide-section');
  const sopHint = page.locator('#sop-top-heading-hint');

  await expect(richTextFormat).toHaveValue('sop');
  await expect(tableStyleSection).not.toHaveClass(/hidden/);
  await expect(documentSection).not.toHaveClass(/hidden/);
  await expect(extraSection).not.toHaveClass(/hidden/);
  await expect(slideSection).toHaveClass(/hidden/);
  await expect(sopHint).not.toHaveClass(/hidden/);

  await richTextFormat.selectOption('plain');

  await expect(tableStyleSection).toHaveClass(/hidden/);
  await expect(documentSection).not.toHaveClass(/hidden/);
  await expect(extraSection).not.toHaveClass(/hidden/);
  await expect(slideSection).toHaveClass(/hidden/);
  await expect(sopHint).toHaveClass(/hidden/);

  await richTextFormat.selectOption('slide-16-9');

  await expect(tableStyleSection).not.toHaveClass(/hidden/);
  await expect(documentSection).toHaveClass(/hidden/);
  await expect(extraSection).toHaveClass(/hidden/);
  await expect(slideSection).not.toHaveClass(/hidden/);
  await expect(sopHint).toHaveClass(/hidden/);
  await expect(page.locator('#preview-font')).toBeVisible();

  await richTextFormat.selectOption('sop');

  await expect(tableStyleSection).not.toHaveClass(/hidden/);
  await expect(documentSection).not.toHaveClass(/hidden/);
  await expect(extraSection).not.toHaveClass(/hidden/);
  await expect(slideSection).toHaveClass(/hidden/);
  await expect(sopHint).not.toHaveClass(/hidden/);
});

test('keeps rich text format selection after reload', async ({ page }) => {
  await page.goto('/');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('plain');
  await page.locator('#sop-settings-close-btn').click();

  await page.reload();
  await page.locator('#sop-settings-btn').click();

  await expect(page.locator('#rich-text-format')).toHaveValue('plain');
  await expect(page.locator('#render-settings-table-style-section')).toHaveClass(/hidden/);
  await expect(page.locator('#sop-top-heading-hint')).toHaveClass(/hidden/);
});

test('converts code block to table only when checkbox is enabled', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');
  const codeBlockMarkdown = '```js\nconst x = 1;\n```';

  await page.locator('#sop-settings-btn').click();
  const codeBlockToTable = page.locator('#code-block-to-table');
  await codeBlockToTable.uncheck();
  await page.locator('#sop-settings-close-btn').click();

  await input.fill(codeBlockMarkdown);
  await expect(preview.locator('pre')).toHaveCount(1);
  await expect(preview.locator('table[data-code-block-table="true"]')).toHaveCount(0);

  await page.locator('#sop-settings-btn').click();
  await codeBlockToTable.check();
  await page.locator('#sop-settings-close-btn').click();

  await input.fill(codeBlockMarkdown);
  await expect(preview.locator('pre')).toHaveCount(0);
  await expect(preview.locator('table[data-code-block-table="true"]')).toHaveCount(1);
});

test('removes bold from headings by default and keeps it when disabled', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');
  const headingMarkdown = '# **Bold Title**\n\nParagraph with **bold**.';

  await page.locator('#sop-settings-btn').click();
  const removeHeadingBold = page.locator('#remove-heading-bold');
  await expect(removeHeadingBold).toBeChecked();
  await page.locator('#sop-settings-close-btn').click();

  await input.fill(headingMarkdown);
  await expect(preview.locator('h2')).toHaveText('Bold Title');
  await expect(preview.locator('h2 strong, h2 b')).toHaveCount(0);
  await expect(preview.locator('p strong')).toHaveText('bold');

  await page.locator('#sop-settings-btn').click();
  await removeHeadingBold.uncheck();
  await page.locator('#sop-settings-close-btn').click();

  await expect(preview.locator('h2 strong')).toHaveText('Bold Title');
  await expect(preview.locator('p strong')).toHaveText('bold');
});

test('keeps remove-heading-bold selection after reload', async ({ page }) => {
  await page.goto('/');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#remove-heading-bold').uncheck();
  await page.locator('#sop-settings-close-btn').click();

  await page.reload();
  await page.locator('#sop-settings-btn').click();

  await expect(page.locator('#remove-heading-bold')).not.toBeChecked();
});

test('applies paragraph line height from render settings', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('# Title\n\nHello paragraph.\n\n- List item');
  await page.locator('#sop-settings-btn').click();

  const lineHeightSelect = page.locator('#paragraph-line-height');
  await expect(lineHeightSelect).toHaveValue('1.5');

  await lineHeightSelect.selectOption('1.15');
  await page.locator('#sop-settings-close-btn').click();

  await expect(preview).toHaveAttribute('style', /--preview-line-height:\s*1\.15/);
  await expect(preview.locator('p').first()).toHaveAttribute('style', /line-height:\s*1\.15/);
  await expect(preview.locator('li').first()).toHaveAttribute('style', /line-height:\s*1\.15/);

  const cssVar = await preview.evaluate(el => getComputedStyle(el).getPropertyValue('--preview-line-height').trim());
  expect(cssVar).toBe('1.15');
});

test('keeps paragraph line height selection after reload', async ({ page }) => {
  await page.goto('/');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#paragraph-line-height').selectOption('1');
  await page.locator('#sop-settings-close-btn').click();

  await page.reload();
  await page.locator('#sop-settings-btn').click();

  await expect(page.locator('#paragraph-line-height')).toHaveValue('1');
  await expect(page.locator('#preview-area')).toHaveAttribute('style', /--preview-line-height:\s*1(?!\.)/);
});

test('applies preview font from render settings', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('| A | B |\n| --- | --- |\n| 1 | 2 |');
  await page.locator('#sop-settings-btn').click();

  const fontSelect = page.locator('#preview-font');
  await expect(fontSelect).toHaveValue('microsoft-jhenghei');
  await expect(preview).toHaveAttribute('data-preview-font', 'microsoft-jhenghei');
  await expect(preview).toHaveAttribute('style', /Microsoft JhengHei/);

  await fontSelect.selectOption('noto-sans-tc');
  await page.locator('#sop-settings-close-btn').click();

  await expect(preview).toHaveAttribute('data-preview-font', 'noto-sans-tc');
  await expect(preview).toHaveAttribute('style', /Noto Sans TC/);
  await expect(preview.locator('font').first()).toHaveAttribute('face', /Noto Sans TC/);
});

test('keeps preview font selection after reload', async ({ page }) => {
  await page.goto('/');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#preview-font').selectOption('noto-sans-tc');
  await page.locator('#sop-settings-close-btn').click();

  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('preview_font')))
    .toBe('noto-sans-tc');

  await page.reload();
  await page.locator('#sop-settings-btn').click();

  await expect(page.locator('#preview-font')).toHaveValue('noto-sans-tc');
  await expect(page.locator('#preview-area')).toHaveAttribute('data-preview-font', 'noto-sans-tc');
  await expect(page.locator('#preview-area')).toHaveAttribute('style', /Noto Sans TC/);
});

test('applies keep-with-next styles on headings', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill('# Title\n\nParagraph under heading.');

  const heading = preview.locator('h2').first();
  await expect(heading).toHaveCSS('page-break-after', 'avoid');
  await expect(heading).toHaveAttribute('style', /page-break-after:\s*avoid/);
  await expect(heading).toHaveAttribute('style', /mso-pagination:\s*widow-orphan lines keep-with-next/);
});
