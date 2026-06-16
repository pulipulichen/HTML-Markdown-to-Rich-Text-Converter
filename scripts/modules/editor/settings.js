export const TOP_HEADING_LEVEL_KEY = "top_heading_level";
export const RICH_TEXT_FORMAT_KEY = "rich_text_format";
export const PASTE_MODE_KEY = "paste_mode";
export const TABLE_STYLE_KEY = "table_style";
export const CODE_BLOCK_TO_TABLE_KEY = "code_block_to_table";
export const MARKDOWN_CONTENT_KEY = "markdown_content";

export const VALID_TABLE_STYLES = ["gray", "blue", "yellow", "red", "green", "purple", "brown"];
export const VALID_RICH_TEXT_FORMATS = ["sop", "plain"];

export async function fetchDefaultMarkdown(t) {
    try {
        const response = await fetch("default_markdown.md");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return (await response.text()).trim();
    } catch (err) {
        console.error(t("error.loadDefaultContent"), err);
        return t("fallback.defaultMarkdownTitle");
    }
}

export async function loadDefaultMarkdown(markdownInput, t) {
    markdownInput.value = await fetchDefaultMarkdown(t);
}

export async function loadInitialContent(markdownInput, t) {
    const savedContent = localStorage.getItem(MARKDOWN_CONTENT_KEY);
    if (savedContent) {
        markdownInput.value = savedContent;
        return;
    }

    await loadDefaultMarkdown(markdownInput, t);
}

export function loadTopHeadingLevel(topHeadingLevelSelect) {
    const savedTopHeadingLevel = localStorage.getItem(TOP_HEADING_LEVEL_KEY);
    if (savedTopHeadingLevel) {
        topHeadingLevelSelect.value = savedTopHeadingLevel;
    }
}

export function loadPasteMode(pasteModeSelect) {
    const savedPasteMode = localStorage.getItem(PASTE_MODE_KEY);
    const validModes = ["replace", "append", "prepend"];

    if (savedPasteMode && validModes.includes(savedPasteMode)) {
        pasteModeSelect.value = savedPasteMode;
    }
}

export function loadRichTextFormat(richTextFormatSelect, renderSettingsElements) {
    const savedRichTextFormat = localStorage.getItem(RICH_TEXT_FORMAT_KEY);
    const richTextFormat = VALID_RICH_TEXT_FORMATS.includes(savedRichTextFormat) ? savedRichTextFormat : "sop";
    richTextFormatSelect.value = richTextFormat;
    updateRichTextFormatUI(richTextFormatSelect, renderSettingsElements);
}

export function loadCodeBlockToTable(codeBlockToTableCheckbox) {
    if (!codeBlockToTableCheckbox) {
        return;
    }

    const savedCodeBlockToTable = localStorage.getItem(CODE_BLOCK_TO_TABLE_KEY);

    if (savedCodeBlockToTable === null) {
        codeBlockToTableCheckbox.checked = true;
        localStorage.setItem(CODE_BLOCK_TO_TABLE_KEY, "true");
        return;
    }

    codeBlockToTableCheckbox.checked = savedCodeBlockToTable === "true";
}

export function loadTableStyle(tableStyleSelect) {
    const savedTableStyle = localStorage.getItem(TABLE_STYLE_KEY);
    const tableStyle = VALID_TABLE_STYLES.includes(savedTableStyle) ? savedTableStyle : "gray";
    tableStyleSelect.value = tableStyle;

    if (typeof window.setTableStyleTheme === "function") {
        window.setTableStyleTheme(tableStyle);
    }
}

export function updateRichTextFormatUI(richTextFormatSelect, renderSettingsElements = {}) {
    const isSopFormat = richTextFormatSelect.value === "sop";
    const { sopSection, sopTopHeadingHint } = renderSettingsElements;

    sopSection?.classList.toggle("hidden", !isSopFormat);
    sopTopHeadingHint?.classList.toggle("hidden", !isSopFormat);
}
