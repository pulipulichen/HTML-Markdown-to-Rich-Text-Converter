# 1.0.2

### Added

- Added a "Paste Mode" selector with `replace`, `append`, and `prepend` strategies for rich-text paste, instead of always overwriting content.
- Persisted `paste_mode` in `localStorage` so the selected mode is retained after page reload.
- Added a guard for blank clipboard content to prevent overwriting existing Markdown and show a user message.

### Changed

- Updated the rich-text paste flow to insert converted Markdown before or after existing content based on mode, with automatic blank-line separation between merged sections.
