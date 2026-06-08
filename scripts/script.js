import { onLanguageChange, t } from "./modules/i18n.js";
import {
    loadInitialContent,
    loadTopHeadingLevel,
    loadPasteMode,
    loadRichTextFormat,
    loadTableStyle,
    loadCodeBlockToTable
} from "./modules/editor/settings.js";
import { getEditorElements } from "./modules/editor/dom.js";
import { createEditorSync } from "./modules/editor/preview-sync.js";
import { bindEditorActions } from "./modules/editor/actions.js";
import { bindMarkdownFileDrop } from "./modules/editor/drag-drop.js";
import { bindSopSettingsModal } from "./modules/editor/sop-settings-modal.js";
import { loadPasteCleanOptions } from "./modules/editor/paste-clean-settings.js";

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
    loadPasteMode(pasteModeSelect);
    loadPasteCleanOptions(pasteCleanCheckboxes);
    loadTableStyle(tableStyleSelect);
    await loadInitialContent(markdownInput, t);
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
