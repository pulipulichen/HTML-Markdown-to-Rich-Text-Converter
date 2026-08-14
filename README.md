# HTML-Markdown-to-Rich-Text-Converter

[English](./README.md) | [繁體中文](./README_zh_tw.md)

A real-time Markdown-to-HTML rich preview tool with rich-text paste-to-Markdown conversion, rich-text copy, and a bilingual UI for faster writing and formatting validation.

- **Live Preview**: [https://pulipulichen.github.io/HTML-Markdown-to-Rich-Text-Converter/](https://pulipulichen.github.io/HTML-Markdown-to-Rich-Text-Converter/)
- **Repository**: [https://github.com/pulipulichen/HTML-Markdown-to-Rich-Text-Converter](https://github.com/pulipulichen/HTML-Markdown-to-Rich-Text-Converter)

## Key Features

- Real-time Markdown parsing with HTML preview
- Rich-text paste to Markdown (replace / append / prepend modes)
- One-click rich-text copy from the preview panel
- Gmail Printable format: convert Gmail Print pages into archive-friendly Markdown (strips the Gmail header and signatures, then flattens message tables)
- Bilingual UI switching (English and Traditional Chinese)
- Persisted editor state in localStorage (content, paste mode, heading level)
- Adjustable top heading level (h1-h6)
- PWA support (manifest + service worker)

## Tech Stack

- Marked
- Turndown + turndown-plugin-gfm
- HTML5 / CSS3
- JavaScript (ES6+)
- Tailwind CSS