# 1.0.1

### Added

- Added a "Paste Rich Text" button to read HTML rich text from the clipboard, convert it to Markdown, insert it into the editor, and refresh the preview.
- Added Word-friendly legacy HTML attributes (`border`, `bgcolor`, `align`, `font`) to converted tables to keep table styling during copy/paste workflows.
- Added a configurable top heading level, defaulting the highest Markdown heading to `h2` while preserving relative heading hierarchy.
- Added a "Remove Empty Lines" button to clean empty lines from the Markdown input and refresh preview immediately.

### Improved

- Improved rich-text table conversion to output GFM Markdown tables, including line-break handling, column padding, and `|` escaping.
- Refactored frontend scripts into focused files to reduce `scripts/script.js` size and improve maintainability.

### Changed

- Preserved original HTML tables when `rowspan` or `colspan` merged cells are detected, because these structures cannot be fully represented in Markdown.
