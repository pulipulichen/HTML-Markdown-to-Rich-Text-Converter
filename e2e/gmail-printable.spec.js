import { test, expect } from '@playwright/test';

const GMAIL_PRINT_HTML = `
<table width="100%">
  <tr>
    <td><img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_server_1x_r2.png" alt="Gmail"></td>
    <td>布丁 &lt;pulipuli.chen@gmail.com&gt;</td>
  </tr>
</table>
<h2>[長欣] 確認未來 AIX 管理架構中的 NIM 角色</h2>
<b>2 封郵件</b>
<table width="100%" class="message" border="1">
  <thead>
    <tr>
      <th>陳勇汀 &lt;pulipuli_chen@ericstar.tw&gt;</th>
      <th>2026年7月27日 下午3:44</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2">
        <div class="recipient">
          <div>收件者: peter.chou@tradevan.com.tw</div>
          <div>副本: 蘇鼎凱 &lt;nasun_su@ericstar.tw&gt;</div>
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <table width="100%" border="0" cellpadding="12">
          <tr>
            <td>
              <p>Peter 您好，</p>
              <ul>
                <li>DRCC 主程式透過 SSH 連線至 NIM。</li>
                <li>NIM 再連線至 HMC。</li>
              </ul>
              <p>勇汀</p>
              <div class="gmail_signature" data-smartmail="gmail_signature">
                <p>開源技術工程師</p>
                <p>陳勇汀 Yung-Ting Chen</p>
                <p>Mobile 0918-325-473</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </tbody>
</table>
<table width="100%" class="message" border="1">
  <thead>
    <tr>
      <th>周明峰 &lt;peter.chou@tradevan.com.tw&gt;</th>
      <th>2026年7月31日 上午9:47</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2">
        <div class="recipient">
          <div class="replyto">回覆: 周明峰 &lt;peter.chou@tradevan.com.tw&gt;</div>
          <div>收件者: 陳勇汀 &lt;pulipuli_chen@ericstar.tw&gt;</div>
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <ol>
          <li>未來正式環境中是否會建置或保留 NIM 控制端？ <font color="#ff0000">會有NIM Server做備份用</font></li>
        </ol>
        <div><font size="1" color="#888888">[隱藏引用文字]</font></div>
      </td>
    </tr>
  </tbody>
</table>
`;

test('converts Gmail Print HTML into archive markdown', async ({ page }) => {
  await page.goto('/');

  const markdown = await page.evaluate((html) => {
    return window.convertGmailPrintToMarkdown(html);
  }, GMAIL_PRINT_HTML);

  expect(markdown.split('\n')[0]).toBe('# [長欣] 確認未來 AIX 管理架構中的 NIM 角色');
  expect(markdown).toContain('# [長欣] 確認未來 AIX 管理架構中的 NIM 角色');
  expect(markdown).toContain('## 陳勇汀 <pulipuli_chen@ericstar.tw>');
  expect(markdown).toContain('**2026年7月27日 下午3:44**');
  expect(markdown).toContain('收件者: peter.chou@tradevan.com.tw');
  expect(markdown).toContain('副本: 蘇鼎凱 <nasun_su@ericstar.tw>');
  expect(markdown).toContain('Peter 您好，');
  expect(markdown).toContain('DRCC 主程式透過 SSH 連線至 NIM。');
  expect(markdown).toContain('## 周明峰 <peter.chou@tradevan.com.tw>');
  expect(markdown).toContain('回覆: 周明峰 <peter.chou@tradevan.com.tw>');
  expect(markdown).toContain('會有NIM Server做備份用');
  expect(markdown).toMatch(/color:\s*#ff0000/i);
  expect(markdown).not.toContain('logo_gmail');
  expect(markdown).not.toContain('布丁 <pulipuli.chen@gmail.com>');
  expect(markdown).not.toContain('2 封郵件');
  expect(markdown).not.toContain('開源技術工程師');
  expect(markdown).not.toContain('0918-325-473');
  expect(markdown).not.toContain('隱藏引用文字');
  expect(markdown).not.toContain('<table');
});

test('keeps subject on its own heading when Gmail Print wraps the thread in a container', async ({ page }) => {
  await page.goto('/');

  const wrappedHtml = `
<div class="bodycontainer">
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td>
        ${GMAIL_PRINT_HTML}
      </td>
    </tr>
  </table>
</div>
`;

  const markdown = await page.evaluate((html) => {
    return window.convertGmailPrintToMarkdown(html);
  }, wrappedHtml);

  expect(markdown.split('\n')[0]).toBe('# [長欣] 確認未來 AIX 管理架構中的 NIM 角色');
  expect(markdown).not.toMatch(/^# .*(陳勇汀|Peter 您好|收件者)/);
  expect(markdown).toContain('## 陳勇汀 <pulipuli_chen@ericstar.tw>');
  expect(markdown).toContain('**2026年7月27日 下午3:44**');
  expect(markdown).toContain('Peter 您好，');
  expect(markdown).toContain('## 周明峰 <peter.chou@tradevan.com.tw>');
});

test('merges adjacent and nested bold tags instead of emitting duplicate asterisks', async ({ page }) => {
  await page.goto('/');

  const html = `
<table class="message" border="1">
  <thead>
    <tr>
      <th>周明峰 &lt;peter.chou@tradevan.com.tw&gt;</th>
      <th>2026年7月31日 上午9:47</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2"><div class="recipient"><div>收件者: 陳勇汀 &lt;pulipuli_chen@ericstar.tw&gt;</div></div></td>
    </tr>
    <tr>
      <td colspan="2">
        <ol>
          <li>附件所整理的既有 DRCC、NIM、HMC 與 AIX 關係是否正確？&nbsp;<strong>DRCC是檢查及執行程序用 、&nbsp;</strong><strong>NIM 是DRCC的主機&nbsp;</strong><strong><strong>、</strong>AIX OS 是登入</strong><strong>NIM後再做管理<strong>、</strong>&nbsp;</strong><strong>HMC是</strong><strong>DRCC連線開關AIX用</strong></li>
        </ol>
      </td>
    </tr>
  </tbody>
</table>
`;

  const markdown = await page.evaluate((content) => {
    return window.convertGmailPrintToMarkdown(content);
  }, html);

  expect(markdown).toContain('DRCC是檢查及執行程序用');
  expect(markdown).toContain('NIM 是DRCC的主機');
  expect(markdown).toContain('AIX OS 是登入');
  expect(markdown).toContain('HMC是');
  expect(markdown).toContain('DRCC連線開關AIX用');
  expect(markdown).not.toMatch(/\*{4}/);
  expect(markdown).toMatch(/\*\*[^*]+\*\*/);
});

test('cleans leftover duplicate bold markers when Gmail Printable is selected', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  await input.fill('1. 關係是否正確？ **HMC是****DRCC連線開關AIX用**');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('gmail-printable');
  await page.locator('#sop-settings-close-btn').click();

  await expect(input).toHaveValue('1. 關係是否正確？ **HMC是DRCC連線開關AIX用**');
  await expect(input).not.toHaveValue(/\*{4}/);
  await expect(page.locator('#preview-area li')).not.toContainText('****');
  await expect(page.locator('#preview-area strong')).toHaveText('HMC是DRCC連線開關AIX用');
});

test('converts mixed markdown and Gmail message tables into archive markdown', async ({ page }) => {
  await page.goto('/');

  const mixedMarkdown = `
| ![Gmail](https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_server_1x_r2.png) | **布丁 <pulipuli.chen@gmail.com>** |
| --- | --- |

* * *

\`\`\`
[長欣] 確認未來 AIX 管理架構中的 NIM 角色
2 封郵件
\`\`\`

* * *

<table width="100%" class="message" border="1">
  <thead>
    <tr>
      <th>陳勇汀 &lt;pulipuli_chen@ericstar.tw&gt;</th>
      <th>2026年7月27日 下午3:44</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2"><div class="recipient"><div>收件者: peter.chou@tradevan.com.tw</div></div></td>
    </tr>
    <tr>
      <td colspan="2">
        <p>Peter 您好，</p>
        <div class="gmail_signature" data-smartmail="gmail_signature">陳勇汀 Yung-Ting Chen</div>
      </td>
    </tr>
  </tbody>
</table>
`.trim();

  const markdown = await page.evaluate((content) => {
    return window.convertGmailPrintToMarkdown(content);
  }, mixedMarkdown);

  expect(markdown).toContain('# [長欣] 確認未來 AIX 管理架構中的 NIM 角色');
  expect(markdown).toContain('## 陳勇汀 <pulipuli_chen@ericstar.tw>');
  expect(markdown).toContain('Peter 您好，');
  expect(markdown).not.toContain('logo_gmail');
  expect(markdown).not.toContain('布丁 <pulipuli.chen@gmail.com>');
  expect(markdown).not.toContain('Yung-Ting Chen');
  expect(markdown).not.toContain('<table');
});

test('keeps regular markdown unchanged when switching to Gmail Printable', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const original = '# Regular note\n\nJust a paragraph.';
  await input.fill(original);

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('gmail-printable');
  await page.locator('#sop-settings-close-btn').click();

  await expect(input).toHaveValue(original);
  await expect(page.locator('#preview-area h2')).toHaveText('Regular note');
});

test('converts Gmail Print tables in the editor when Gmail Printable is selected', async ({ page }) => {
  await page.goto('/');

  const input = page.locator('#markdown-input');
  const preview = page.locator('#preview-area');

  await input.fill(GMAIL_PRINT_HTML);

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('gmail-printable');
  await page.locator('#sop-settings-close-btn').click();

  await expect(input).toHaveValue(/# \[長欣\] 確認未來 AIX 管理架構中的 NIM 角色/);
  await expect(input).toHaveValue(/## 陳勇汀 <pulipuli_chen@ericstar.tw>/);
  await expect(input).not.toHaveValue(/logo_gmail/);
  await expect(input).not.toHaveValue(/gmail_signature/);
  await expect(input).not.toHaveValue(/開源技術工程師/);
  await expect(preview.locator('img[alt="Gmail"]')).toHaveCount(0);
  await expect(preview.getByText('開源技術工程師')).toHaveCount(0);
  await expect(preview.getByText('Peter 您好，')).toBeVisible();
  await expect(preview.getByText('會有NIM Server做備份用')).toBeVisible();
});

test('keeps Gmail Printable format after reload', async ({ page }) => {
  await page.goto('/');

  await page.locator('#sop-settings-btn').click();
  await page.locator('#rich-text-format').selectOption('gmail-printable');
  await page.locator('#sop-settings-close-btn').click();

  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('rich_text_format')))
    .toBe('gmail-printable');

  await page.reload();
  await page.locator('#sop-settings-btn').click();

  await expect(page.locator('#rich-text-format')).toHaveValue('gmail-printable');
  await expect(page.locator('#gmail-printable-hint')).not.toHaveClass(/hidden/);
  await expect(page.locator('#sop-top-heading-hint')).toHaveClass(/hidden/);
  await expect(page.locator('#render-settings-slide-section')).toHaveClass(/hidden/);
});
