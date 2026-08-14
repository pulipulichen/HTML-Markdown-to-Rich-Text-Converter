# 1.0.7

### Added

- Added a Gmail Printable rich-text format that converts Gmail Print pages into archive-friendly Markdown by removing the Gmail header and signatures and flattening message tables.

### Fixed

- Collapsed adjacent and nested bold tags from Gmail Print so Markdown no longer keeps leftover `****` markers.
- Kept the Gmail Print subject on its own heading instead of flattening the thread header and first message into one line.

### Documentation

- Restructured release notes into per-version files under `changelog/` and converted root `CHANGELOG.md` into an index-only entry point.
