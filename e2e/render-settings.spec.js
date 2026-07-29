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

test('toggles SOP-only render settings when rich text format changes', async ({ page }) => {
  await page.goto('/');
  await page.locator('#sop-settings-btn').click();

  const richTextFormat = page.locator('#rich-text-format');
  const sopSection = page.locator('#render-settings-sop-section');
  const sopHint = page.locator('#sop-top-heading-hint');

  await expect(richTextFormat).toHaveValue('sop');
  await expect(sopSection).not.toHaveClass(/hidden/);
  await expect(sopHint).not.toHaveClass(/hidden/);

  await richTextFormat.selectOption('plain');

  await expect(sopSection).toHaveClass(/hidden/);
  await expect(sopHint).toHaveClass(/hidden/);

  await richTextFormat.selectOption('sop');

  await expect(sopSection).not.toHaveClass(/hidden/);
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
  await expect(page.locator('#render-settings-sop-section')).toHaveClass(/hidden/);
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
