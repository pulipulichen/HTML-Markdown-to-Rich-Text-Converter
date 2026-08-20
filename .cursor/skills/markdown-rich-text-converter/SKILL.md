---
name: markdown-rich-text-converter
description: Guide for maintaining and modifying the HTML/Markdown to Rich Text Converter project. Use when modifying Markdown parsing, filterMarkdown logic, preview rendering, nested lists, table formatting, rich text copy/paste pipelines, UI/i18n, or running E2E tests.
---

# Markdown to Rich Text Converter 開發與維護指南

本專案為即時 Markdown 轉富文字（HTML/Rich Text）轉換器，支援 SOP 手冊、Slide 16:9、Plain 與 Gmail Printable 等模式，並支援雙向貼上/複製轉換。

---

## 核心資料流向與架構

```
[Markdown 輸入] ──> filterMarkdown() ──> marked.parse() ──> DOM 後處理 (updatePreview) ──> [#preview-area]
                                                                                               │
                                                               ┌───────────────────────────────┘
                                                               ▼
                                                    [複製富文字 copyRichText]
                                                               │
                                                               ▼
                                                    [剪貼簿 HTML (含 Word 相容樣式)]

[剪貼簿富文字] ──> cleanPasteHtml() ──> convertHtmlToMarkdown() ──> sanitizePastedMarkdown() ──> [Markdown 輸入]
```

---

## 修改功能時的查詢與修改對照表

當需要進行修改時，請依據修改類型查詢對應的模組與檔案：

### 1. Markdown 語法解析與正規化前處理
* **核心檔案**：`scripts/transform/filter-markdown.js`
* **負責邏輯**：
  - 清理 Markdown 代碼區塊標記、註解表格標籤 (`[!NOTE]`) 等。
  - 粗體符號修復 (`collapseBrokenBoldMarkers`、`normalizeBoldDelimiters`)。
  - 清單縮排正規化 (`normalizeListIndentation`)。
  - 移除清單項目間多餘空行 (`removeBlankLinesBetweenListItems`)。
* **關鍵注意事項**：
  - **嚴禁破壞行首縮排**：進行正規化或多餘空格合併（如 `[ \t]{2,}`）時，必須先保留行首的縮排空白 `^[ \t]*`，否則會破壞巢狀清單（Indented/Nested Lists）與縮排程式碼區塊的層級。
  - **巢狀清單縮排寬度**：CommonMark 要求子清單縮排需 ≥ 父項目符號寬度（`- ` 為 2 欄）。來源文件常只用 1 個空格，會被解析成同層項目。`normalizeListIndentation` 會依「來源相對縮排深度」重新計算為合法縮排寬度。
  - **所有文字轉換必須跳過程式碼區塊**：使用既有的 `mapOutsideFencedCode` 與 `mapOutsideInlineCode` 包裝，避免改動 fenced code 或 inline code 內容。
  - **緊湊清單 (tight list)**：清單項目之間若存在空行，marked 會判定為 loose list 並將每個項目包成 `<p>`，造成預覽與複製結果出現多餘間距。`removeBlankLinesBetweenListItems` 會移除清單「內部」的空行，但保留清單「前後」與一般段落之間的空行。

### 2. 預覽畫面渲染與 DOM 後處理
* **核心檔案**：`scripts/preview/render-preview.js`
* **負責邏輯**：
  - `updatePreview()`：主渲染入口，協調各階段 DOM 轉換。
  - 標題層級正規化 (`normalizeHeadingLevels`) 與移除標題粗體 (`removeBoldFormattingFromHeadings`)。
  - 單格表格轉 Code Block (`convertCodeBlocksToSingleCellTables`)。
  - 表格單元格換行轉清單 (`convertTableCellBrBulletsToLists`)。
  - 表格多餘空行/空欄裁切與合併 (`trimTrailingEmptyTableEdges`, `mergeTrailingEmptyTableCells`)。
  - 各格式樣式套用 (`applyRichTextFormat`、`applySlideTextStyles`、`applyParagraphLineHeightStyles`)。
  - 標題分頁保護樣式 (`applyHeadingKeepWithNextStyles`)。

### 3. 排版外觀與 CSS 樣式
* **核心檔案**：
  - `styles/preview-area.css`：預覽區基本排版（字型、行高、段落間距、`h1~h6` 邊距、`ul/ol` 多層巢狀清單符號與邊距、表格外觀）。
  - `styles/code.css`：程式碼與程式碼表格樣式。
  - `styles/style.css`：工具列與整體介面樣式。

### 4. 表格主題與配色
* **核心檔案**：
  - `scripts/converters/html-to-markdown-converter.js`：定義 `TABLE_STYLE_THEMES`（Gray, Blue, Yellow, Red, Green, Purple, Brown 等配色定義）。
  - `scripts/modules/editor/settings.js`：表格主題切換與設定儲存邏輯。

### 5. 富文字複製 (Copy Rich Text)
* **核心檔案**：`scripts/clipboard/copy-rich-text.js`
* **負責邏輯**：
  - `buildRichTextClipboardHtml()`：建構相容於 Microsoft Word / Google Docs 的 HTML。
  - 將 `mso-pagination: widow-orphan lines keep-with-next;` 及 `page-break-after: avoid;` 正確寫入複製的 HTML 樣式中。

### 6. 貼上富文字清理與轉 Markdown (Paste Rich Text Pipeline)
* **核心檔案**：
  - `scripts/transform/clean-paste-html.js`：清洗從 Word 或網頁複製來的雜訊 HTML（清理 Word 垃圾屬性 `times=""`、移除不必要字型/色彩/表格中繼資料）。
  - `scripts/converters/html-to-markdown-converter.js`：透過 Turndown 將 HTML 解析轉換回 Markdown 格式。
  - `scripts/converters/gmail-print-to-markdown.js`：Gmail 列印格式專用清理轉換器。
  - `scripts/modules/editor/paste.js`：剪貼簿貼上處理入口與模式管理（Replace, Append, Prepend）。

### 7. 介面控制、彈窗與多語系 (i18n)
* **核心檔案**：
  - `index.html`：DOM 結構與資料屬性 `data-i18n`。
  - `scripts/modules/editor/actions.js` / `dom.js` / `sop-settings-modal.js` / `paste-clean-settings.js`。
  - `scripts/modules/i18n/zh-TW.js` 與 `scripts/modules/i18n/en.js`：多語系字典檔。
* **注意事項**：新增或修改任何 UI 文字時，請務必同時更新 `zh-TW.js` 與 `en.js`。

---

## 測試與驗證流程

### 1. 執行 E2E 測試
專案環境規定所有測試透過 Podman 容器執行：

```bash
podman compose run --rm test-runner
```

### 2. 撰寫與更新測試
* 測試檔案位於 `e2e/` 資料夾：
  - `e2e/render-preview.spec.js`：預覽渲染、清單、表格轉換等測試。
  - `e2e/render-settings.spec.js`：渲染設定彈窗與選項測試。
  - `e2e/slide-format.spec.js`：Slide 16:9 模式測試。
  - `e2e/table-style.spec.js`：表格色彩主題測試。
  - `e2e/gmail-printable.spec.js`：Gmail 列印轉換測試。
  - `e2e/i18n.spec.js`：多語系切換測試。
* 任何邏輯修復或功能調整後，均應新增/維護對應的 E2E 測試並確認全數通過。
