# 1.0.4

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
