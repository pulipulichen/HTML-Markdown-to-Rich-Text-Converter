# 1.0.5

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
