# HTML-Markdown-to-Rich-Text-Converter

[English](./README.md) | [繁體中文](./README_zh_tw.md)

即時將 Markdown 轉換為 HTML 富文本預覽的工具，支援富文本貼上轉 Markdown、富文本複製與雙語介面，協助你在撰寫時同步確認內容與排版。

- **線上預覽**：[https://pulipulichen.github.io/HTML-Markdown-to-Rich-Text-Converter/](https://pulipulichen.github.io/HTML-Markdown-to-Rich-Text-Converter/)
- **專案網址**：[https://github.com/pulipulichen/HTML-Markdown-to-Rich-Text-Converter](https://github.com/pulipulichen/HTML-Markdown-to-Rich-Text-Converter)

## 主要功能

- 即時解析 Markdown 並顯示 HTML 預覽
- 富文本貼上轉 Markdown（支援取代 / 附加 / 前置模式）
- 一鍵複製預覽區為富文本到剪貼簿
- Gmail 列印頁格式：把 Gmail 列印頁轉成便於保存的 Markdown（移除 Gmail 頁首與簽名檔，並把信件表格攤平成一般內容）
- 支援英文與繁體中文介面切換
- 記住編輯內容、貼上模式、標題層級（localStorage）
- 可調整最頂層標題層級（h1-h6）
- 支援 PWA（manifest + service worker）

## 技術堆疊

- Marked
- Turndown + turndown-plugin-gfm
- HTML5 / CSS3
- JavaScript (ES6+)
- Tailwind CSS
