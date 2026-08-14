import { onLanguageChange, t } from "./modules/i18n.js";
import {
    loadInitialContent,
    loadTopHeadingLevel,
    loadPasteMode,
    loadRichTextFormat,
    loadTableStyle,
    loadCodeBlockToTable,
    loadBlankLineAfterTables,
    loadRemoveHeadingBold,
    loadSlideLineHeight,
    loadSlideTableFontSize,
    loadSlideTextFontSize,
    loadSlideApplyTableColorsToText,
    loadSlideHeaderType,
    loadSlideTableWidth,
    loadSlideTableHeight,
    loadParagraphLineHeight,
    loadPreviewFont,
    MARKDOWN_CONTENT_KEY
} from "./modules/editor/settings.js";
import { getEditorElements } from "./modules/editor/dom.js";
import { createEditorSync } from "./modules/editor/preview-sync.js";
import { bindEditorActions } from "./modules/editor/actions.js";
import { bindMarkdownFileDrop } from "./modules/editor/drag-drop.js";
import { bindSopSettingsModal } from "./modules/editor/sop-settings-modal.js";
import { loadPasteCleanOptions } from "./modules/editor/paste-clean-settings.js";
import { applyGmailPrintableSourceConversion } from "./modules/editor/paste.js";

const elements = getEditorElements();
const {
    markdownInput,
    topHeadingLevelSelect,
    richTextFormatSelect,
    pasteModeSelect,
    pasteCleanSettingsBtn,
    pasteCleanModal,
    pasteCleanCloseBtn,
    pasteCleanCloseIconBtn,
    pasteCleanCheckboxes,
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
    sopSettingsBtn,
    sopSettingsModal,
    sopSettingsCloseBtn,
    sopSettingsCloseIconBtn,
    renderSettingsElements
} = elements;

const {
    updateEditorPreview,
    showEditorToast,
    refreshLocalizedRuntimeText
} = createEditorSync({
    markdownInput: elements.markdownInput,
    previewArea: elements.previewArea,
    topHeadingLevelSelect: elements.topHeadingLevelSelect,
    richTextFormatSelect: elements.richTextFormatSelect,
    codeBlockToTableCheckbox: elements.codeBlockToTableCheckbox,
    blankLineAfterTablesCheckbox: elements.blankLineAfterTablesCheckbox,
    removeHeadingBoldCheckbox: elements.removeHeadingBoldCheckbox,
    slideLineHeightSelect: elements.slideLineHeightSelect,
    slideTableFontSizeSelect: elements.slideTableFontSizeSelect,
    slideTextFontSizeSelect: elements.slideTextFontSizeSelect,
    slideApplyTableColorsToTextCheckbox: elements.slideApplyTableColorsToTextCheckbox,
    slideHeaderTypeSelect: elements.slideHeaderTypeSelect,
    slideTableWidthSelect: elements.slideTableWidthSelect,
    slideTableHeightSelect: elements.slideTableHeightSelect,
    paragraphLineHeightSelect: elements.paragraphLineHeightSelect,
    messageBox: elements.messageBox,
    t
});

bindSopSettingsModal({
    modal: sopSettingsModal,
    openBtn: sopSettingsBtn,
    closeBtn: sopSettingsCloseBtn,
    closeIconBtn: sopSettingsCloseIconBtn
});

bindSopSettingsModal({
    modal: pasteCleanModal,
    openBtn: pasteCleanSettingsBtn,
    closeBtn: pasteCleanCloseBtn,
    closeIconBtn: pasteCleanCloseIconBtn
});

window.addEventListener("load", async () => {
    loadTopHeadingLevel(topHeadingLevelSelect);
    loadRichTextFormat(richTextFormatSelect, renderSettingsElements);
    loadCodeBlockToTable(codeBlockToTableCheckbox);
    loadBlankLineAfterTables(blankLineAfterTablesCheckbox);
    loadRemoveHeadingBold(removeHeadingBoldCheckbox);
    loadSlideLineHeight(slideLineHeightSelect);
    loadSlideTableFontSize(slideTableFontSizeSelect);
    loadSlideTextFontSize(slideTextFontSizeSelect);
    loadSlideApplyTableColorsToText(slideApplyTableColorsToTextCheckbox);
    loadSlideHeaderType(slideHeaderTypeSelect);
    loadSlideTableWidth(slideTableWidthSelect);
    loadSlideTableHeight(slideTableHeightSelect);
    loadParagraphLineHeight(paragraphLineHeightSelect, elements.previewArea);
    loadPreviewFont(previewFontSelect, elements.previewArea);
    loadPasteMode(pasteModeSelect);
    loadPasteCleanOptions(pasteCleanCheckboxes);
    loadTableStyle(tableStyleSelect);
    await loadInitialContent(markdownInput, t);
    if (richTextFormatSelect.value === "gmail-printable") {
        applyGmailPrintableSourceConversion(markdownInput, MARKDOWN_CONTENT_KEY);
    }
    updateEditorPreview();
    refreshLocalizedRuntimeText();
});

bindEditorActions({
    elements,
    t,
    updateEditorPreview,
    showEditorToast
});

bindMarkdownFileDrop({
    markdownInput: elements.markdownInput,
    markdownDropOverlay: elements.markdownDropOverlay,
    t,
    updateEditorPreview,
    showEditorToast
});

onLanguageChange(() => {
    refreshLocalizedRuntimeText();
});
