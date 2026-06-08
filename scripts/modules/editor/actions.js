import {
    TOP_HEADING_LEVEL_KEY,
    RICH_TEXT_FORMAT_KEY,
    PASTE_MODE_KEY,
    TABLE_STYLE_KEY,
    CODE_BLOCK_TO_TABLE_KEY,
    MARKDOWN_CONTENT_KEY,
    loadDefaultMarkdown,
    updateRichTextFormatUI
} from "./settings.js";
import { pasteRichTextAsMarkdown } from "./paste.js";
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
        updateEditorPreview();
        localStorage.setItem(RICH_TEXT_FORMAT_KEY, richTextFormatSelect.value);
    });

    codeBlockToTableCheckbox.addEventListener("change", () => {
        updateEditorPreview();
        localStorage.setItem(CODE_BLOCK_TO_TABLE_KEY, codeBlockToTableCheckbox.checked ? "true" : "false");
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
