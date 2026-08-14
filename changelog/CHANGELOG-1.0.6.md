# 1.0.6

### Added

- Added a **Slide 16:9** Copy Rich Text Format in Render Settings, keeping Font and Table Style while hiding SOP/document-oriented options.
- Added Slide table sizing controls: width (`full` `960px` / `half` `450px` / `auto`) and height (`full` `420px` / `half` `210px` / `auto`, default `full`).
- Added Slide header-type modes (`both-primary` / `column-primary` / `row-primary`) with primary and secondary header colors.
- Added separate Slide font-size controls for tables (default `18`) and other text (default `20`), plus slide line height (default `1.15`).
- Added a Slide checkbox to apply table colors to non-table text (body text uses table body color; bold uses the table header/dark color).
- Added Playwright E2E coverage for Slide 16:9 visibility, table styling, header types, width/height, font sizes, color application, bullet-list cells, and settings persistence.
- Added Playwright E2E coverage for SOP/Plain table-cell bullet conversion (including mixed text-and-bullet and `*` bullets), trailing empty row/column trimming, and body-row `colspan` merging.

### Changed

- Styled Slide tables with horizontal zebra striping, `2px` base cell padding, centered cells by default, and fixed-width/height output suited for 16:9 slides.
- When Slide table height is set, the first header row uses `font-size × 1.5` and remaining height is shared by body rows.
- For Slide first-column headers (primary or secondary), applied `white-space: nowrap` and extra horizontal padding of `0.5 ×` table font size; first-row headers also get extra vertical padding of `0.5 ×` table font size.
- Converted Slide table cells that use `<br>`-separated `-` / `*` bullets into left-aligned `<ul><li>` lists, with list-item top/bottom margins of `0.5 ×` table font size.
- Applied `0.5 ×` text font-size bottom margin to non-table Slide list items.
- Reorganized the Render Settings modal into a wider two-column layout so Slide-related options take less vertical space.
- Reset preview body font size to SOP/Plain `12pt` when leaving Slide 16:9, so Slide font sizes no longer linger after switching formats.
- Retuned Table Style palettes to muted slide-friendly colors for gray, blue, yellow, red, green, purple, and brown (updated header, secondary header, body, zebra, text, and border values).
- When a table body row has exactly one non-first cell with content and all cells to its right are empty, those empty cells are merged into the filled cell with `colspan` (first column is never merged).
- Fully empty trailing table rows (bottom) and columns (right) are omitted from the preview instead of being rendered as blank cells.
- When Slide table width is `auto`, every cell gets extra horizontal padding (`2px + 0.5 ×` table font size); when height is `auto`, every cell gets the same extra vertical padding.

### Fixed

- Fixed heading keep-with-next handling for Chromium: preview uses browser-safe `break-after` / `page-break-after` plus `data-mso-pagination`, and Copy Rich Text injects Word-oriented `mso-pagination` into the clipboard HTML (live DOM style attributes cannot retain unknown CSS properties).
- Fixed Slide table padding E2E expectations to use computed padding values (`14px` for `2px + 9pt` extras) instead of raw `calc()` strings that Chromium rewrites in style attributes.
- Fixed table-cell bullet conversion so lines starting with `- ` / `* ` (including those split by `<br>`) become `<ul><li>` in SOP and Plain previews, not only Slide; mixed text-and-bullet cells and single-bullet cells are supported.
- Fixed extra blank lines after converted table-cell lists by not inserting `<br>` next to `<ul>` and by zeroing list margins inside table cells.
