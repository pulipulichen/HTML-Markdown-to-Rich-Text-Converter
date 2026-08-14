function isEmptyLine(line) {
    return line.trim() === "";
}

function collapseConsecutiveEmptyLines(markdown) {
    const lines = markdown.split(/\r?\n/);
    const result = [];
    let inCodeFence = false;
    let lastWasEmpty = false;

    for (const line of lines) {
        if (/^```/.test(line.trim())) {
            inCodeFence = !inCodeFence;
            result.push(line);
            lastWasEmpty = false;
            continue;
        }

        if (inCodeFence) {
            result.push(line);
            continue;
        }

        if (isEmptyLine(line)) {
            if (lastWasEmpty) {
                continue;
            }

            lastWasEmpty = true;
            result.push("");
            continue;
        }

        lastWasEmpty = false;
        result.push(line);
    }

    return result.join("\n");
}

function unescapeHeadingNumberedPrefixes(markdown) {
    return markdown.replace(/^(#{1,6}\s+\d+)\\. /gm, "$1. ");
}

function tightenConsecutiveListItems(markdown) {
    return markdown
        .replace(/^(\s*[-*+]\s+.+)\n\n+(?=^\s*[-*+]\s+)/gm, "$1\n")
        .replace(/^(\s*\d+\.\s+.+)\n\n+(?=^\s*\d+\.\s+)/gm, "$1\n")
        .replace(/^(\s*[-*+]\s+.+)\n[ \t]+\n(?=^\s*[-*+]\s+)/gm, "$1\n")
        .replace(/^(\s*\d+\.\s+.+)\n[ \t]+\n(?=^\s*\d+\.\s+)/gm, "$1\n");
}

function sanitizePastedMarkdown(markdown) {
    const lines = markdown.split(/\r?\n/);
    const firstLine = lines[0]?.trim();
    const lastLine = lines[lines.length - 1]?.trim();

    if (firstLine === "**" && lastLine === "**" && lines.length >= 2) {
        lines.shift();
        lines.pop();
    }

    const normalizedMarkdown = tightenConsecutiveListItems(
        unescapeHeadingNumberedPrefixes(lines.join("\n"))
    );
    const withCollapsedBold = typeof window.collapseBrokenBoldMarkers === "function"
        ? window.collapseBrokenBoldMarkers(normalizedMarkdown)
        : normalizedMarkdown;

    return collapseConsecutiveEmptyLines(withCollapsedBold).trim();
}

function mergeMarkdownContent(currentContent, incomingContent, mode) {
    const currentText = currentContent.trim();

    if (mode === "append") {
        if (!currentText) return incomingContent;
        return `${currentText}\n\n${incomingContent}`;
    }

    if (mode === "prepend") {
        if (!currentText) return incomingContent;
        return `${incomingContent}\n\n${currentText}`;
    }

    return incomingContent;
}

function getLocalizedPasteMode(mode, t) {
    const modeKeyMap = {
        replace: "controls.pasteModeReplace",
        append: "controls.pasteModeAppend",
        prepend: "controls.pasteModePrepend"
    };

    const key = modeKeyMap[mode];
    return key ? t(key) : mode;
}

function convertPastedContentToMarkdown(html, text, pasteCleanOptions, richTextFormat) {
    const useGmailPrintable = richTextFormat === "gmail-printable";

    if (html && useGmailPrintable && window.isGmailPrintContent?.(html)) {
        return window.convertGmailPrintToMarkdown(html);
    }

    if (!html && text && useGmailPrintable && window.isGmailPrintContent?.(text)) {
        return window.convertGmailPrintToMarkdown(text);
    }

    if (html) {
        return window.convertHtmlToMarkdown(html, {
            skipTableStyles: Boolean(pasteCleanOptions?.tableStyle)
        });
    }

    return text;
}

export function applyGmailPrintableSourceConversion(markdownInput, markdownContentKey) {
    if (!markdownInput) {
        return false;
    }

    const result = window.tryConvertGmailPrintToMarkdown?.(markdownInput.value);
    let nextMarkdown = result?.converted ? result.markdown : markdownInput.value;

    if (typeof window.collapseBrokenBoldMarkers === "function") {
        nextMarkdown = window.collapseBrokenBoldMarkers(nextMarkdown);
    }

    if (nextMarkdown === markdownInput.value) {
        return Boolean(result?.converted);
    }

    markdownInput.value = nextMarkdown;
    if (markdownContentKey) {
        localStorage.setItem(markdownContentKey, nextMarkdown);
    }

    return true;
}

export async function pasteRichTextAsMarkdown({
    markdownInput,
    pasteModeSelect,
    previewArea,
    markdownContentKey,
    updateEditorPreview,
    showEditorToast,
    pasteCleanOptions,
    richTextFormat,
    t
}) {
    try {
        const clipboardContent = await window.readClipboardContent();
        if (!clipboardContent) {
            showEditorToast(t("toast.clipboardEmpty"));
            return;
        }

        const html = clipboardContent.html
            ? window.cleanPasteHtml(clipboardContent.html, pasteCleanOptions)
            : null;
        const markdown = convertPastedContentToMarkdown(
            html,
            clipboardContent.text,
            pasteCleanOptions,
            richTextFormat
        );
        const sanitizedMarkdown = sanitizePastedMarkdown(markdown);

        if (!sanitizedMarkdown) {
            showEditorToast(t("toast.clipboardBlank"));
            return;
        }

        const pasteMode = pasteModeSelect.value;
        markdownInput.value = mergeMarkdownContent(markdownInput.value, sanitizedMarkdown, pasteMode);
        updateEditorPreview();
        localStorage.setItem(markdownContentKey, markdownInput.value);
        const localizedMode = getLocalizedPasteMode(pasteMode, t);

        if (window.copyRichText(previewArea)) {
            showEditorToast(t("toast.pasteAndCopied", { mode: localizedMode }));
        } else {
            showEditorToast(t("toast.pasteCopyFailed", { mode: localizedMode }));
        }
    } catch (err) {
        console.error("Unable to read clipboard:", err);
        showEditorToast(t("toast.clipboardPermissionDenied"));
    }
}
