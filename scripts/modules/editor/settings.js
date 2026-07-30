export const TOP_HEADING_LEVEL_KEY = "top_heading_level";
export const RICH_TEXT_FORMAT_KEY = "rich_text_format";
export const PASTE_MODE_KEY = "paste_mode";
export const TABLE_STYLE_KEY = "table_style";
export const CODE_BLOCK_TO_TABLE_KEY = "code_block_to_table";
export const BLANK_LINE_AFTER_TABLES_KEY = "blank_line_after_tables";
export const REMOVE_HEADING_BOLD_KEY = "remove_heading_bold";
export const SLIDE_LINE_HEIGHT_KEY = "slide_line_height";
export const SLIDE_FONT_SIZE_KEY = "slide_font_size";
export const SLIDE_TABLE_FONT_SIZE_KEY = "slide_table_font_size";
export const SLIDE_TEXT_FONT_SIZE_KEY = "slide_text_font_size";
export const SLIDE_APPLY_TABLE_COLORS_TO_TEXT_KEY = "slide_apply_table_colors_to_text";
export const SLIDE_HEADER_TYPE_KEY = "slide_header_type";
export const SLIDE_TABLE_WIDTH_KEY = "slide_table_width";
export const SLIDE_TABLE_HEIGHT_KEY = "slide_table_height";
export const PARAGRAPH_LINE_HEIGHT_KEY = "paragraph_line_height";
export const PREVIEW_FONT_KEY = "preview_font";
export const MARKDOWN_CONTENT_KEY = "markdown_content";

export const VALID_TABLE_STYLES = ["gray", "blue", "yellow", "red", "green", "purple", "brown"];
export const VALID_RICH_TEXT_FORMATS = ["sop", "plain", "slide-16-9"];
export const VALID_PARAGRAPH_LINE_HEIGHTS = ["1", "1.15", "1.5"];
export const DEFAULT_PARAGRAPH_LINE_HEIGHT = "1.5";
export const DEFAULT_SLIDE_LINE_HEIGHT = "1.15";
export const VALID_SLIDE_FONT_SIZES = ["12", "14", "16", "18", "20", "22", "24"];
export const DEFAULT_SLIDE_TABLE_FONT_SIZE = "18";
export const DEFAULT_SLIDE_TEXT_FONT_SIZE = "20";
export const VALID_SLIDE_HEADER_TYPES = ["both-primary", "column-primary", "row-primary"];
export const DEFAULT_SLIDE_HEADER_TYPE = "both-primary";
export const VALID_SLIDE_TABLE_WIDTHS = ["full", "half"];
export const DEFAULT_SLIDE_TABLE_WIDTH = "full";
export const SLIDE_TABLE_WIDTH_PX = {
    full: "960",
    half: "450"
};
export const VALID_SLIDE_TABLE_HEIGHTS = ["full", "half", "auto"];
export const DEFAULT_SLIDE_TABLE_HEIGHT = "full";
export const SLIDE_TABLE_HEIGHT_PX = {
    full: "420",
    half: "210"
};
export const VALID_PREVIEW_FONTS = ["noto-sans-tc", "microsoft-jhenghei"];
export const DEFAULT_PREVIEW_FONT = "microsoft-jhenghei";

export const PREVIEW_FONT_FAMILIES = {
    "noto-sans-tc": '"Noto Sans TC", "Microsoft JhengHei", 微軟正黑體, Arial, "Helvetica Neue", Helvetica, sans-serif',
    "microsoft-jhenghei": '"Microsoft JhengHei", 微軟正黑體, Arial, "Helvetica Neue", Helvetica, sans-serif'
};

export const PREVIEW_FONT_FACES = {
    "noto-sans-tc": "Noto Sans TC, Microsoft JhengHei, Arial",
    "microsoft-jhenghei": "Microsoft JhengHei, Arial"
};

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

export function loadBlankLineAfterTables(blankLineAfterTablesCheckbox) {
    if (!blankLineAfterTablesCheckbox) {
        return;
    }

    const savedBlankLineAfterTables = localStorage.getItem(BLANK_LINE_AFTER_TABLES_KEY);

    if (savedBlankLineAfterTables === null) {
        blankLineAfterTablesCheckbox.checked = true;
        localStorage.setItem(BLANK_LINE_AFTER_TABLES_KEY, "true");
        return;
    }

    blankLineAfterTablesCheckbox.checked = savedBlankLineAfterTables === "true";
}

export function loadRemoveHeadingBold(removeHeadingBoldCheckbox) {
    if (!removeHeadingBoldCheckbox) {
        return;
    }

    const savedRemoveHeadingBold = localStorage.getItem(REMOVE_HEADING_BOLD_KEY);

    if (savedRemoveHeadingBold === null) {
        removeHeadingBoldCheckbox.checked = true;
        localStorage.setItem(REMOVE_HEADING_BOLD_KEY, "true");
        return;
    }

    removeHeadingBoldCheckbox.checked = savedRemoveHeadingBold === "true";
}

export function normalizeSlideLineHeight(lineHeight) {
    return VALID_PARAGRAPH_LINE_HEIGHTS.includes(lineHeight) ? lineHeight : DEFAULT_SLIDE_LINE_HEIGHT;
}

export function loadSlideLineHeight(slideLineHeightSelect) {
    if (!slideLineHeightSelect) {
        return DEFAULT_SLIDE_LINE_HEIGHT;
    }

    const savedLineHeight = localStorage.getItem(SLIDE_LINE_HEIGHT_KEY);
    const lineHeight = normalizeSlideLineHeight(savedLineHeight);
    slideLineHeightSelect.value = lineHeight;
    return lineHeight;
}

export function normalizeSlideFontSize(fontSize, defaultSize = DEFAULT_SLIDE_TABLE_FONT_SIZE) {
    return VALID_SLIDE_FONT_SIZES.includes(String(fontSize)) ? String(fontSize) : defaultSize;
}

export function loadSlideTableFontSize(slideTableFontSizeSelect) {
    if (!slideTableFontSizeSelect) {
        return DEFAULT_SLIDE_TABLE_FONT_SIZE;
    }

    const savedFontSize = localStorage.getItem(SLIDE_TABLE_FONT_SIZE_KEY)
        ?? localStorage.getItem(SLIDE_FONT_SIZE_KEY);
    const fontSize = normalizeSlideFontSize(savedFontSize, DEFAULT_SLIDE_TABLE_FONT_SIZE);
    slideTableFontSizeSelect.value = fontSize;
    return fontSize;
}

export function loadSlideTextFontSize(slideTextFontSizeSelect) {
    if (!slideTextFontSizeSelect) {
        return DEFAULT_SLIDE_TEXT_FONT_SIZE;
    }

    const savedFontSize = localStorage.getItem(SLIDE_TEXT_FONT_SIZE_KEY);
    const fontSize = normalizeSlideFontSize(savedFontSize, DEFAULT_SLIDE_TEXT_FONT_SIZE);
    slideTextFontSizeSelect.value = fontSize;
    return fontSize;
}

export function loadSlideApplyTableColorsToText(slideApplyTableColorsToTextCheckbox) {
    if (!slideApplyTableColorsToTextCheckbox) {
        return false;
    }

    const savedValue = localStorage.getItem(SLIDE_APPLY_TABLE_COLORS_TO_TEXT_KEY);

    if (savedValue === null) {
        slideApplyTableColorsToTextCheckbox.checked = false;
        localStorage.setItem(SLIDE_APPLY_TABLE_COLORS_TO_TEXT_KEY, "false");
        return false;
    }

    slideApplyTableColorsToTextCheckbox.checked = savedValue === "true";
    return slideApplyTableColorsToTextCheckbox.checked;
}

export function normalizeSlideHeaderType(headerType) {
    return VALID_SLIDE_HEADER_TYPES.includes(headerType) ? headerType : DEFAULT_SLIDE_HEADER_TYPE;
}

export function loadSlideHeaderType(slideHeaderTypeSelect) {
    if (!slideHeaderTypeSelect) {
        return DEFAULT_SLIDE_HEADER_TYPE;
    }

    const savedHeaderType = localStorage.getItem(SLIDE_HEADER_TYPE_KEY);
    const headerType = normalizeSlideHeaderType(savedHeaderType);
    slideHeaderTypeSelect.value = headerType;
    return headerType;
}

export function normalizeSlideTableWidth(tableWidth) {
    return VALID_SLIDE_TABLE_WIDTHS.includes(tableWidth) ? tableWidth : DEFAULT_SLIDE_TABLE_WIDTH;
}

export function loadSlideTableWidth(slideTableWidthSelect) {
    if (!slideTableWidthSelect) {
        return DEFAULT_SLIDE_TABLE_WIDTH;
    }

    const savedTableWidth = localStorage.getItem(SLIDE_TABLE_WIDTH_KEY);
    const tableWidth = normalizeSlideTableWidth(savedTableWidth);
    slideTableWidthSelect.value = tableWidth;
    return tableWidth;
}

export function normalizeSlideTableHeight(tableHeight) {
    return VALID_SLIDE_TABLE_HEIGHTS.includes(tableHeight) ? tableHeight : DEFAULT_SLIDE_TABLE_HEIGHT;
}

export function loadSlideTableHeight(slideTableHeightSelect) {
    if (!slideTableHeightSelect) {
        return DEFAULT_SLIDE_TABLE_HEIGHT;
    }

    const savedTableHeight = localStorage.getItem(SLIDE_TABLE_HEIGHT_KEY);
    const tableHeight = normalizeSlideTableHeight(savedTableHeight);
    slideTableHeightSelect.value = tableHeight;
    return tableHeight;
}

export function normalizeParagraphLineHeight(lineHeight) {
    return VALID_PARAGRAPH_LINE_HEIGHTS.includes(lineHeight) ? lineHeight : DEFAULT_PARAGRAPH_LINE_HEIGHT;
}

export function applyParagraphLineHeight(previewArea, lineHeight) {
    if (!previewArea) {
        return DEFAULT_PARAGRAPH_LINE_HEIGHT;
    }

    const normalizedLineHeight = normalizeParagraphLineHeight(lineHeight);
    previewArea.style.setProperty("--preview-line-height", normalizedLineHeight);
    previewArea.dataset.paragraphLineHeight = normalizedLineHeight;
    return normalizedLineHeight;
}

export function loadParagraphLineHeight(paragraphLineHeightSelect, previewArea) {
    if (!paragraphLineHeightSelect) {
        return DEFAULT_PARAGRAPH_LINE_HEIGHT;
    }

    const savedLineHeight = localStorage.getItem(PARAGRAPH_LINE_HEIGHT_KEY);
    const lineHeight = normalizeParagraphLineHeight(savedLineHeight);
    paragraphLineHeightSelect.value = lineHeight;
    return applyParagraphLineHeight(previewArea, lineHeight);
}

export function normalizePreviewFont(font) {
    return VALID_PREVIEW_FONTS.includes(font) ? font : DEFAULT_PREVIEW_FONT;
}

export function applyPreviewFont(previewArea, font) {
    const normalizedFont = normalizePreviewFont(font);
    const fontFamily = PREVIEW_FONT_FAMILIES[normalizedFont];
    const fontFace = PREVIEW_FONT_FACES[normalizedFont];

    if (previewArea) {
        previewArea.style.setProperty("--preview-font-family", fontFamily);
        previewArea.style.fontFamily = fontFamily;
        previewArea.dataset.previewFont = normalizedFont;
    }

    if (typeof window.setPreviewFontFace === "function") {
        window.setPreviewFontFace(fontFace);
    }

    return normalizedFont;
}

export function loadPreviewFont(previewFontSelect, previewArea) {
    if (!previewFontSelect) {
        return applyPreviewFont(previewArea, DEFAULT_PREVIEW_FONT);
    }

    const savedFont = localStorage.getItem(PREVIEW_FONT_KEY);
    const font = normalizePreviewFont(savedFont);
    previewFontSelect.value = font;
    return applyPreviewFont(previewArea, font);
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
    const format = richTextFormatSelect.value;
    const isSopFormat = format === "sop";
    const isSlideFormat = format === "slide-16-9";
    const isPlainFormat = format === "plain";
    const {
        tableStyleSection,
        documentSection,
        extraSection,
        slideSection,
        sopTopHeadingHint
    } = renderSettingsElements;

    tableStyleSection?.classList.toggle("hidden", isPlainFormat);
    documentSection?.classList.toggle("hidden", isSlideFormat);
    extraSection?.classList.toggle("hidden", isSlideFormat);
    slideSection?.classList.toggle("hidden", !isSlideFormat);
    sopTopHeadingHint?.classList.toggle("hidden", !isSopFormat);
}
