# CHANGELOG

## 1.0.6

### Added

- Added a **Slide 16:9** Copy Rich Text Format in Render Settings, keeping Font and Table Style while hiding SOP/document-oriented options.
- Added Slide table sizing controls: width (`full` `960px` / `half` `450px`) and height (`full` `420px` / `half` `210px` / `auto`, default `full`).
- Added Slide header-type modes (`both-primary` / `column-primary` / `row-primary`) with primary and secondary header colors.
- Added separate Slide font-size controls for tables (default `18`) and other text (default `20`), plus slide line height (default `1.15`).
- Added a Slide checkbox to apply table colors to non-table text (body text uses table body color; bold uses the table header/dark color).
- Added Playwright E2E coverage for Slide 16:9 visibility, table styling, header types, width/height, font sizes, color application, bullet-list cells, and settings persistence.

### Changed

- Styled Slide tables with horizontal zebra striping, `2px` base cell padding, centered cells by default, and fixed-width/height output suited for 16:9 slides.
- When Slide table height is set, the first header row uses `font-size × 1.5` and remaining height is shared by body rows.
- For Slide first-column headers (primary or secondary), applied `white-space: nowrap` and extra horizontal padding of `0.5 ×` table font size; first-row headers also get extra vertical padding of `0.5 ×` table font size.
- Converted Slide table cells that use `<br>`-separated `-` / `*` bullets into left-aligned `<ul><li>` lists, with list-item top/bottom margins of `0.5 ×` table font size.
- Applied `0.5 ×` text font-size bottom margin to non-table Slide list items.
- Reorganized the Render Settings modal into a wider two-column layout so Slide-related options take less vertical space.
- Reset preview body font size to SOP/Plain `12pt` when leaving Slide 16:9, so Slide font sizes no longer linger after switching formats.
- Retuned Table Style palettes to muted slide-friendly colors for gray, blue, yellow, red, green, purple, and brown (updated header, secondary header, body, zebra, text, and border values).

### Fixed

- Fixed heading keep-with-next handling for Chromium: preview uses browser-safe `break-after` / `page-break-after` plus `data-mso-pagination`, and Copy Rich Text injects Word-oriented `mso-pagination` into the clipboard HTML (live DOM style attributes cannot retain unknown CSS properties).
- Fixed Slide table padding E2E expectations to use computed padding values (`14px` for `2px + 9pt` extras) instead of raw `calc()` strings that Chromium rewrites in style attributes.

## 1.0.5

### Added

- Added a **Clean Rich Text Paste** settings modal next to Rich Paste Mode, with per-option checkboxes for font family/size, colors, bold, italic, hyperlinks, table metadata, and table styles, persisted in `localStorage` (`paste_clean_options`).
- Added **Select All** and **Deselect All** controls in the paste-clean modal for faster bulk toggling.
- Added `scripts/transform/clean-paste-html.js` to sanitize clipboard HTML before Markdown conversion, and `scripts/modules/editor/paste-clean-settings.js` for option load/save helpers.
- Added English and Traditional Chinese labels for all paste-clean controls and hints.
- Added a Render Settings checkbox **Remove bold formatting in headings** (`remove_heading_bold`), enabled by default, that unwraps `<strong>`/`<b>` inside heading tags in the live preview while leaving body bold unchanged.
- Added a Render Settings **Paragraph Line Height** selector (`1` / `1.15` / `1.5`, default `1.5`), persisted in `localStorage` (`paragraph_line_height`), applied to preview paragraphs and list items (`p`, `li`) via CSS variable and inline styles for copy fidelity.
- Added a Render Settings **Font** selector (`Microsoft JhengHei` default / `Noto Sans TC`), persisted in `localStorage` (`preview_font`), applied to the live preview and Word-oriented table `<font face>` output.
- Added keep-with-next print styles on preview headings (`page-break-after: avoid`, `break-after: avoid-page`, and Word-oriented `mso-pagination: keep-with-next`) so headings stay with the following paragraph when printing or pasting into Word where supported.
- Added a Render Settings checkbox **Add blank line after tables** (`blank_line_after_tables`), enabled by default, that inserts a trailing `<br>` after regular tables and code-block tables in preview/copy output.

### Changed

- Set rich-text table cell padding to `2px 6px` (top/bottom `2`, left/right `6`) on `td`/`th` for SOP, Plain, and code-block tables in preview and copy output.
- Moved editor and preview toolbar actions from the top header into a **sticky two-column navbar** above the Markdown Input and Live Preview panels (left: Clear, Load Demo, Remove Empty Lines, paste mode, paste-clean settings, Paste Rich Text; right: Render Settings, Copy Rich Text).
- Simplified the top header to the app title and language selector only; moved Render Settings out of the Live Preview panel header into the preview toolbar.
- Defaulted **Convert code blocks to single-cell table** (`code_block_to_table`) to enabled when no saved preference exists in `localStorage`.

### Improved

- Improved rich-text paste font cleanup to strip `font`/`span`/`div` inline styles, unwrap `font` and `span` wrappers, remove Word-broken font attributes (for example `times=""`, `new=""`, `roman";font-weight:...`), and flatten nested `<div>` elements inside table cells.
- Improved rich-text paste table metadata cleanup to remove `xmlns`, `dir`, and `data-*` attributes from table-related elements while keeping structural presentation attributes until table-style cleanup runs.
- Improved rich-text paste table style cleanup to strip `border`, `cellpadding`, `cellspacing`, `width`, `bordercolor`, and related attributes down to bare `<table>` markup.
- Improved HTML-to-Markdown conversion during paste to skip `applyWordTableStyles` when table-style cleanup is enabled, so stripped table attributes are not re-applied after sanitization.
- Improved Word-friendly table output by wrapping the first row in `<thead>` for repeatable page headers and applying single line-height (`line-height: 1`) on tables.
- Updated code-block single-cell tables to use a light gray background (`#f3f4f6`), tighter line-height, and a trailing line break after each converted table.

### Fixed

- Fixed bold preview for CommonMark edge cases by trimming spaces inside `**...**` (for example `** text**`) and inserting a space after closing `**` when punctuation is followed immediately by a letter/number (for example `**（untagged）**範例`, `**標題：**內文`), while leaving fenced and inline code untouched.

## 1.0.4

### Added

- Added a "Load Default Markdown" toolbar button that loads `default_markdown.md` into the editor, prompts before replacing existing content, persists the result in `localStorage` (`markdown_content`), and includes English and Traditional Chinese labels.
- Added an option to convert fenced code blocks into single-cell tables with plain styling (white background, black text, border color matching the selected Table Style in SOP mode or default black borders in Plain mode), persisted in `localStorage` (`code_block_to_table`).
- Added a Render Settings modal for preview output options, opened from a gear button in the Live Preview toolbar.
- Added rich-text paste conversion for single-cell tables (1 row, 1 column) to fenced code blocks instead of GFM tables.
- Added dedicated Playwright E2E coverage for Render Settings (modal open/close behavior, SOP/plain visibility toggles, persisted format selection, and code-block-to-table conversion behavior).
- Added dedicated Playwright E2E coverage for Table Style rendering and persistence, including color-theme assertions in preview tables after style changes and page reload.
- Added Markdown file drag-and-drop loading for the editor input (`.md` and `.markdown`), with drop-zone visual highlighting, localized success/error toasts, and `localStorage` synchronization after file load.
- Added a full-screen drag-and-drop overlay with localized guidance text and document-wide drop handling, so users can drop supported Markdown files anywhere on the page.

### Fixed

- Fixed rich-text paste conversion escaping numbered heading prefixes (for example `### 1. Title` becoming `### 1\. Title`) by restoring Turndown-escaped sequences after conversion.
- Fixed rich-text paste conversion inserting blank lines between consecutive list items when source HTML wraps each `<li>` in a `<p>` or `<div>`, by unwrapping those block elements before Turndown runs and tightening leftover spacing in paste sanitization.
- Fixed rich-text paste conversion for single-cell tables to preserve line breaks from block elements such as `<p>` and `<br>`, so multi-line terminal output stays intact inside code blocks.
- Fixed single-cell code block table borders in preview and copy output to use each Table Style theme's dark border color instead of the default gray or black border.
- Fixed Podman-based E2E report write failures (`EACCES` on `playwright-report`) by documenting and applying user-owned workspace/report directory permissions when running tests in rootless container workflows.
- Fixed GitHub Actions Podman setup failures on `ubuntu-latest` caused by `apt` dependency conflicts (`crun`/`criu`) by installing Podman via `gacts/install-podman@v1` and installing `podman-compose` via `pip`.

### Improved

- Updated the English toolbar labels from "Clear Content" to "Clear" and from "Load Default Markdown" to "Load Demo", and reordered the three editor action buttons to `Clear` → `Load Demo` → `Remove Empty Lines` while keeping the "Remove Empty Lines" wording unchanged.
- Renamed SOP Settings to Render Settings and consolidated Copy Rich Text Format, Top Heading Level, Table Style, and code-block conversion into a single modal dialog.
- Added an SOP-specific hint in Render Settings recommending h2 as the top heading level for SOP manuals.
- Kept the code-block-to-table option available in both SOP Manual and Plain formats; only Table Style remains SOP-specific in the modal.
- Aligned the Markdown Input and Live Preview panel header bars to equal height on desktop by restructuring the main workspace with CSS Grid, so the left label row matches the taller right-side toolbar controls.
- Improved rich-text paste sanitization to collapse consecutive empty lines (including whitespace-only lines) to a single blank line, while leaving blank lines inside fenced code blocks unchanged.
- Improved rich-text paste HTML preprocessing to unwrap `<p>` and `<div>` block elements inside list items before Markdown conversion, producing compact bullet lists that match the source layout more closely.
- Renamed the project from `HTML-Markdown-Preview` to `HTML-Markdown-to-Rich-Text-Converter` across README titles/links and package metadata fields.
- Split monolithic `e2e/basic.spec.js` into feature-focused spec files (`render-preview`, `render-settings`, `table-style`, `i18n`, and `pwa`) to improve test maintainability and reviewability.
- Switched local and CI E2E orchestration from Docker Compose to Podman Compose (`package.json` and `.github/workflows/e2e.yml`), including CI setup for `podman` and `podman-compose`.
- Refactored editor orchestration by splitting `scripts/script.js` into focused modules (`scripts/modules/editor/dom.js`, `preview-sync.js`, `actions.js`, and `drag-drop.js`) while keeping runtime behavior unchanged.

## 1.0.3

### Added

- Introduced an i18n architecture (`scripts/modules/i18n/en.js`, `scripts/modules/i18n/zh-TW.js`, and `scripts/modules/i18n.js`), added `data-i18n` / `data-i18n-attr` bindings in `index.html`, and shipped a language switcher with `localStorage` persistence (`markdown_preview_language`).
- Added i18n Playwright scenarios for initial language detection, manual switching, reload persistence, and console error checks, and split project documentation into bilingual files (`README.md` and `README_zh_tw.md`).
- Added a "Table Style" selector for rich-text table output with seven themes and persisted the selected value in `localStorage` (`table_style`).
- Added Markdown cleanup improvements to remove trailing numeric citation tags (for example `[15]` or `[12, 15]`) before `。`, and render `[!NOTE]` lines as highlighted notes.
- Added a "Copy Rich Text Format" selector in Live Preview with `SOP Manual` and `Plain` modes, persisted the selection in `localStorage` (`rich_text_format`), and applied plain-mode table output with default black borders.

### Fixed

- Fixed Docker E2E failures caused by host `node_modules` shadowing Playwright in the container by adding an anonymous `/app/node_modules` volume in `docker-compose.yml`.
- Fixed Playwright artifact/report path conflicts by removing `--output=/app/playwright-report-videos` from `Dockerfile.test` and using `outputDir: test-results` from `playwright.config.js`.
- Fixed an invalid regular expression in `scripts/filter.js` (`/^\n=++\n$/`) that caused a runtime `SyntaxError`, replacing it with a multiline-safe rule for repeated `=` lines.
- Fixed rich-text paste sanitization to remove wrapper lines when the first and last lines are standalone `**`, then apply final `trim()` before merge.

### Improved

- Added `.jshintrc` lint configuration to allow no trailing semicolons (`asi: true`) and support modern JavaScript syntax used in this project.
- Refactored `scripts/script.js` by extracting editor settings/loading and rich-text paste flow into `scripts/modules/editor/settings.js` and `scripts/modules/editor/paste.js`.
- Reorganized legacy script files into purpose-based directories and clearer names (for example, `scripts/rich-text-to-markdown.js` to `scripts/converters/html-to-markdown-converter.js`) and updated script imports in `index.html`.

## 1.0.2

- Added a "Paste Mode" selector with `replace`, `append`, and `prepend` strategies for rich-text paste, instead of always overwriting content.
- Updated the rich-text paste flow to insert converted Markdown before or after existing content based on mode, with automatic blank-line separation between merged sections.
- Persisted `paste_mode` in `localStorage` so the selected mode is retained after page reload.
- Added a guard for blank clipboard content to prevent overwriting existing Markdown and show a user message.

## 1.0.1

- Added a "Paste Rich Text" button to read HTML rich text from the clipboard, convert it to Markdown, insert it into the editor, and refresh the preview.
- Improved rich-text table conversion to output GFM Markdown tables, including line-break handling, column padding, and `|` escaping.
- Preserved original HTML tables when `rowspan` or `colspan` merged cells are detected, because these structures cannot be fully represented in Markdown.
- Added Word-friendly legacy HTML attributes (`border`, `bgcolor`, `align`, `font`) to converted tables to keep table styling during copy/paste workflows.
- Added a configurable top heading level, defaulting the highest Markdown heading to `h2` while preserving relative heading hierarchy.
- Refactored frontend scripts into focused files to reduce `scripts/script.js` size and improve maintainability.
- Added a "Remove Empty Lines" button to clean empty lines from the Markdown input and refresh preview immediately.
