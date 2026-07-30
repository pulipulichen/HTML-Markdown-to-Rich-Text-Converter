export function getEditorElements() {
    const markdownInput = document.getElementById("markdown-input");
    const previewArea = document.getElementById("preview-area");
    const copyBtn = document.getElementById("copy-btn");
    const pasteRichBtn = document.getElementById("paste-rich-btn");
    const clearBtn = document.getElementById("clear-btn");
    const removeEmptyLinesBtn = document.getElementById("remove-empty-lines-btn");
    const loadDefaultMarkdownBtn = document.getElementById("load-default-markdown-btn");
    const messageBox = document.getElementById("message-box");
    const topHeadingLevelSelect = document.getElementById("top-heading-level");
    const richTextFormatSelect = document.getElementById("rich-text-format");
    const pasteModeSelect = document.getElementById("paste-mode");
    const pasteCleanSettingsBtn = document.getElementById("paste-clean-settings-btn");
    const pasteCleanModal = document.getElementById("paste-clean-modal");
    const pasteCleanCloseBtn = document.getElementById("paste-clean-close-btn");
    const pasteCleanCloseIconBtn = document.getElementById("paste-clean-close-icon");
    const pasteCleanSelectAllBtn = document.getElementById("paste-clean-select-all-btn");
    const pasteCleanDeselectAllBtn = document.getElementById("paste-clean-deselect-all-btn");
    const pasteCleanCheckboxes = {
        font: document.getElementById("paste-clean-font"),
        color: document.getElementById("paste-clean-color"),
        bold: document.getElementById("paste-clean-bold"),
        italic: document.getElementById("paste-clean-italic"),
        links: document.getElementById("paste-clean-links"),
        tableMetadata: document.getElementById("paste-clean-table-metadata"),
        tableStyle: document.getElementById("paste-clean-table-style")
    };
    const tableStyleSelect = document.getElementById("table-style");
    const codeBlockToTableCheckbox = document.getElementById("code-block-to-table");
    const blankLineAfterTablesCheckbox = document.getElementById("blank-line-after-tables");
    const removeHeadingBoldCheckbox = document.getElementById("remove-heading-bold");
    const slideLineHeightSelect = document.getElementById("slide-line-height");
    const slideTableFontSizeSelect = document.getElementById("slide-table-font-size");
    const slideTextFontSizeSelect = document.getElementById("slide-text-font-size");
    const slideApplyTableColorsToTextCheckbox = document.getElementById("slide-apply-table-colors-to-text");
    const slideHeaderTypeSelect = document.getElementById("slide-header-type");
    const slideTableWidthSelect = document.getElementById("slide-table-width");
    const slideTableHeightSelect = document.getElementById("slide-table-height");
    const paragraphLineHeightSelect = document.getElementById("paragraph-line-height");
    const previewFontSelect = document.getElementById("preview-font");
    const sopSettingsBtn = document.getElementById("sop-settings-btn");
    const sopSettingsModal = document.getElementById("sop-settings-modal");
    const sopSettingsCloseBtn = document.getElementById("sop-settings-close-btn");
    const sopSettingsCloseIconBtn = document.getElementById("sop-settings-close-icon");
    const renderSettingsTableStyleSection = document.getElementById("render-settings-table-style-section");
    const renderSettingsDocumentSection = document.getElementById("render-settings-document-section");
    const renderSettingsExtraSection = document.getElementById("render-settings-extra-section");
    const renderSettingsSlideSection = document.getElementById("render-settings-slide-section");
    const sopTopHeadingHint = document.getElementById("sop-top-heading-hint");
    const markdownDropOverlay = document.getElementById("markdown-drop-overlay");

    return {
        markdownInput,
        previewArea,
        copyBtn,
        pasteRichBtn,
        clearBtn,
        removeEmptyLinesBtn,
        loadDefaultMarkdownBtn,
        messageBox,
        topHeadingLevelSelect,
        richTextFormatSelect,
        pasteModeSelect,
        pasteCleanSettingsBtn,
        pasteCleanModal,
        pasteCleanCloseBtn,
        pasteCleanCloseIconBtn,
        pasteCleanSelectAllBtn,
        pasteCleanDeselectAllBtn,
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
        markdownDropOverlay,
        renderSettingsElements: {
            tableStyleSection: renderSettingsTableStyleSection,
            documentSection: renderSettingsDocumentSection,
            extraSection: renderSettingsExtraSection,
            slideSection: renderSettingsSlideSection,
            sopTopHeadingHint
        }
    };
}
