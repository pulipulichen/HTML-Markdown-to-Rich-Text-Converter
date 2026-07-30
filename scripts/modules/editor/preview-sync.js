export function createEditorSync({
    markdownInput,
    previewArea,
    topHeadingLevelSelect,
    richTextFormatSelect,
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
    messageBox,
    t
}) {
    function updateEditorPreview() {
        const richTextFormat = richTextFormatSelect.value;
        const isSlideFormat = richTextFormat === "slide-16-9";

        updatePreview(
            markdownInput,
            previewArea,
            topHeadingLevelSelect.value,
            richTextFormat,
            isSlideFormat ? false : codeBlockToTableCheckbox.checked,
            isSlideFormat ? false : (removeHeadingBoldCheckbox?.checked ?? true),
            isSlideFormat
                ? (slideLineHeightSelect?.value ?? "1.15")
                : (paragraphLineHeightSelect?.value ?? "1.5"),
            isSlideFormat ? false : (blankLineAfterTablesCheckbox?.checked ?? true),
            {
                headerType: slideHeaderTypeSelect?.value ?? "both-primary",
                tableFontSize: slideTableFontSizeSelect?.value ?? "18",
                textFontSize: slideTextFontSizeSelect?.value ?? "20",
                applyTableColorsToText: slideApplyTableColorsToTextCheckbox?.checked ?? false,
                lineHeight: slideLineHeightSelect?.value ?? "1.15",
                tableWidth: slideTableWidthSelect?.value ?? "full",
                tableHeight: slideTableHeightSelect?.value ?? "full"
            }
        );
    }

    function showEditorToast(msg) {
        showToast(messageBox, msg);
    }

    function refreshLocalizedRuntimeText() {
        messageBox.textContent = t("toast.copiedToClipboard");
    }

    return {
        updateEditorPreview,
        showEditorToast,
        refreshLocalizedRuntimeText
    };
}
