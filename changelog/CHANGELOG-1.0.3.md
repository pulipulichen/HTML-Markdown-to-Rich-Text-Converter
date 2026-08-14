# 1.0.3

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
