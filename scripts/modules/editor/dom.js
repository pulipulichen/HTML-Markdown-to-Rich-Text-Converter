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
    const removeHeadingBoldCheckbox = document.getElementById("remove-heading-bold");
    const sopSettingsBtn = document.getElementById("sop-settings-btn");
    const sopSettingsModal = document.getElementById("sop-settings-modal");
    const sopSettingsCloseBtn = document.getElementById("sop-settings-close-btn");
    const sopSettingsCloseIconBtn = document.getElementById("sop-settings-close-icon");
    const renderSettingsSopSection = document.getElementById("render-settings-sop-section");
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
        removeHeadingBoldCheckbox,
        sopSettingsBtn,
        sopSettingsModal,
        sopSettingsCloseBtn,
        sopSettingsCloseIconBtn,
        markdownDropOverlay,
        renderSettingsElements: {
            sopSection: renderSettingsSopSection,
            sopTopHeadingHint
        }
    };
}
