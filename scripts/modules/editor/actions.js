import {
    TOP_HEADING_LEVEL_KEY,
    RICH_TEXT_FORMAT_KEY,
    PASTE_MODE_KEY,
    TABLE_STYLE_KEY,
    CODE_BLOCK_TO_TABLE_KEY,
    BLANK_LINE_AFTER_TABLES_KEY,
    REMOVE_HEADING_BOLD_KEY,
    SLIDE_LINE_HEIGHT_KEY,
    SLIDE_TABLE_FONT_SIZE_KEY,
    SLIDE_TEXT_FONT_SIZE_KEY,
    SLIDE_APPLY_TABLE_COLORS_TO_TEXT_KEY,
    SLIDE_HEADER_TYPE_KEY,
    SLIDE_TABLE_WIDTH_KEY,
    SLIDE_TABLE_HEIGHT_KEY,
    PARAGRAPH_LINE_HEIGHT_KEY,
    PREVIEW_FONT_KEY,
    MARKDOWN_CONTENT_KEY,
    DEFAULT_SLIDE_TABLE_FONT_SIZE,
    DEFAULT_SLIDE_TEXT_FONT_SIZE,
    loadDefaultMarkdown,
    updateRichTextFormatUI,
    applyParagraphLineHeight,
    applyPreviewFont,
    normalizeSlideLineHeight,
    normalizeSlideFontSize,
    normalizeSlideHeaderType,
    normalizeSlideTableWidth,
    normalizeSlideTableHeight
} from "./settings.js";
import { applyGmailPrintableSourceConversion, pasteRichTextAsMarkdown } from "./paste.js";
import {
    getPasteCleanOptions,
    savePasteCleanOptions,
    readPasteCleanOptionsFromCheckboxes,
    setAllPasteCleanCheckboxes
} from "./paste-clean-settings.js";

export function bindEditorActions({ elements, t, updateEditorPreview, showEditorToast }) {
    const {
        markdownInput,
        previewArea,
        copyBtn,
        pasteRichBtn,
        clearBtn,
        removeEmptyLinesBtn,
        loadDefaultMarkdownBtn,
        topHeadingLevelSelect,
        richTextFormatSelect,
        pasteModeSelect,
        pasteCleanCheckboxes,
        pasteCleanSelectAllBtn,
        pasteCleanDeselectAllBtn,
        tableStyleSelect,
        codeBlockToTableCheckbox,
        blankLineAfterTablesCheckbox,
        removeHeadingBoldCheckbox,
        slideLineHeightSelect,
        slideTableFontSizeSelect,
        slideTextFontSizeSelect,
        slideApplyTableColorsToTextCheckbox,
        slideHeaderTypeSelect,
        slideTableWidthSelect,
        slideTableHeightSelect,
        paragraphLineHeightSelect,
        previewFontSelect,
        renderSettingsElements
    } = elements;

    markdownInput.addEventListener("input", () => {
        updateEditorPreview();
        localStorage.setItem(MARKDOWN_CONTENT_KEY, markdownInput.value);
    });

    topHeadingLevelSelect.addEventListener("change", () => {
        updateEditorPreview();
        localStorage.setItem(TOP_HEADING_LEVEL_KEY, topHeadingLevelSelect.value);
    });

    richTextFormatSelect.addEventListener("change", () => {
        updateRichTextFormatUI(richTextFormatSelect, renderSettingsElements);
        localStorage.setItem(RICH_TEXT_FORMAT_KEY, richTextFormatSelect.value);

        if (richTextFormatSelect.value === "gmail-printable"
            && applyGmailPrintableSourceConversion(markdownInput, MARKDOWN_CONTENT_KEY)) {
            showEditorToast(t("toast.gmailPrintConverted"));
        }

        updateEditorPreview();
    });

    codeBlockToTableCheckbox.addEventListener("change", () => {
        updateEditorPreview();
        localStorage.setItem(CODE_BLOCK_TO_TABLE_KEY, codeBlockToTableCheckbox.checked ? "true" : "false");
    });

    blankLineAfterTablesCheckbox?.addEventListener("change", () => {
        updateEditorPreview();
        localStorage.setItem(BLANK_LINE_AFTER_TABLES_KEY, blankLineAfterTablesCheckbox.checked ? "true" : "false");
    });

    removeHeadingBoldCheckbox?.addEventListener("change", () => {
        updateEditorPreview();
        localStorage.setItem(REMOVE_HEADING_BOLD_KEY, removeHeadingBoldCheckbox.checked ? "true" : "false");
    });

    slideLineHeightSelect?.addEventListener("change", () => {
        const lineHeight = normalizeSlideLineHeight(slideLineHeightSelect.value);
        slideLineHeightSelect.value = lineHeight;
        updateEditorPreview();
        localStorage.setItem(SLIDE_LINE_HEIGHT_KEY, lineHeight);
    });

    slideTableFontSizeSelect?.addEventListener("change", () => {
        const fontSize = normalizeSlideFontSize(slideTableFontSizeSelect.value, DEFAULT_SLIDE_TABLE_FONT_SIZE);
        slideTableFontSizeSelect.value = fontSize;
        updateEditorPreview();
        localStorage.setItem(SLIDE_TABLE_FONT_SIZE_KEY, fontSize);
    });

    slideTextFontSizeSelect?.addEventListener("change", () => {
        const fontSize = normalizeSlideFontSize(slideTextFontSizeSelect.value, DEFAULT_SLIDE_TEXT_FONT_SIZE);
        slideTextFontSizeSelect.value = fontSize;
        updateEditorPreview();
        localStorage.setItem(SLIDE_TEXT_FONT_SIZE_KEY, fontSize);
    });

    slideApplyTableColorsToTextCheckbox?.addEventListener("change", () => {
        updateEditorPreview();
        localStorage.setItem(
            SLIDE_APPLY_TABLE_COLORS_TO_TEXT_KEY,
            slideApplyTableColorsToTextCheckbox.checked ? "true" : "false"
        );
    });

    slideHeaderTypeSelect?.addEventListener("change", () => {
        const headerType = normalizeSlideHeaderType(slideHeaderTypeSelect.value);
        slideHeaderTypeSelect.value = headerType;
        updateEditorPreview();
        localStorage.setItem(SLIDE_HEADER_TYPE_KEY, headerType);
    });

    slideTableWidthSelect?.addEventListener("change", () => {
        const tableWidth = normalizeSlideTableWidth(slideTableWidthSelect.value);
        slideTableWidthSelect.value = tableWidth;
        updateEditorPreview();
        localStorage.setItem(SLIDE_TABLE_WIDTH_KEY, tableWidth);
    });

    slideTableHeightSelect?.addEventListener("change", () => {
        const tableHeight = normalizeSlideTableHeight(slideTableHeightSelect.value);
        slideTableHeightSelect.value = tableHeight;
        updateEditorPreview();
        localStorage.setItem(SLIDE_TABLE_HEIGHT_KEY, tableHeight);
    });

    paragraphLineHeightSelect?.addEventListener("change", () => {
        const lineHeight = applyParagraphLineHeight(previewArea, paragraphLineHeightSelect.value);
        paragraphLineHeightSelect.value = lineHeight;
        updateEditorPreview();
        localStorage.setItem(PARAGRAPH_LINE_HEIGHT_KEY, lineHeight);
    });

    previewFontSelect?.addEventListener("change", () => {
        const font = applyPreviewFont(previewArea, previewFontSelect.value);
        previewFontSelect.value = font;
        updateEditorPreview();
        localStorage.setItem(PREVIEW_FONT_KEY, font);
    });

    pasteModeSelect.addEventListener("change", () => {
        localStorage.setItem(PASTE_MODE_KEY, pasteModeSelect.value);
    });

    tableStyleSelect.addEventListener("change", () => {
        const tableStyle = tableStyleSelect.value;
        if (typeof window.setTableStyleTheme === "function") {
            window.setTableStyleTheme(tableStyle);
        }
        updateEditorPreview();
        localStorage.setItem(TABLE_STYLE_KEY, tableStyle);
    });

    pasteRichBtn.addEventListener("click", async () => {
        await pasteRichTextAsMarkdown({
            markdownInput,
            pasteModeSelect,
            previewArea,
            markdownContentKey: MARKDOWN_CONTENT_KEY,
            updateEditorPreview,
            showEditorToast,
            pasteCleanOptions: getPasteCleanOptions(),
            richTextFormat: richTextFormatSelect.value,
            t
        });
    });

    Object.values(pasteCleanCheckboxes).forEach(checkbox => {
        checkbox?.addEventListener("change", () => {
            savePasteCleanOptions(readPasteCleanOptionsFromCheckboxes(pasteCleanCheckboxes));
        });
    });

    pasteCleanSelectAllBtn?.addEventListener("click", () => {
        setAllPasteCleanCheckboxes(pasteCleanCheckboxes, true);
    });

    pasteCleanDeselectAllBtn?.addEventListener("click", () => {
        setAllPasteCleanCheckboxes(pasteCleanCheckboxes, false);
    });

    copyBtn.addEventListener("click", () => {
        if (markdownInput.value.trim() === "") return;

        if (copyRichText(previewArea)) {
            showEditorToast(t("toast.richCopiedSuccess"));
        } else {
            showEditorToast(t("toast.copyFailed"));
        }
    });

    clearBtn.addEventListener("click", () => {
        if (!confirm(t("confirm.clearAll"))) return;
        markdownInput.value = "";
        updateEditorPreview();
        localStorage.removeItem(MARKDOWN_CONTENT_KEY);
    });

    loadDefaultMarkdownBtn.addEventListener("click", async () => {
        if (markdownInput.value.trim() !== "" && !confirm(t("confirm.loadDefaultMarkdown"))) {
            return;
        }

        await loadDefaultMarkdown(markdownInput, t);
        updateEditorPreview();
        localStorage.setItem(MARKDOWN_CONTENT_KEY, markdownInput.value);
        showEditorToast(t("toast.defaultMarkdownLoaded"));
    });

    removeEmptyLinesBtn.addEventListener("click", () => {
        const lines = markdownInput.value.split("\n");
        const compacted = lines.filter(line => line.trim() !== "").join("\n");

        if (compacted === markdownInput.value) {
            showEditorToast(t("toast.noEmptyLines"));
            return;
        }

        markdownInput.value = compacted;
        updateEditorPreview();
        localStorage.setItem(MARKDOWN_CONTENT_KEY, markdownInput.value);
        showEditorToast(t("toast.removedEmptyLines"));
    });
}
