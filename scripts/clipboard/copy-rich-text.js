const COPY_HEADING_KEEP_WITH_NEXT_STYLE =
    "page-break-after: avoid; break-after: avoid-page; mso-pagination: widow-orphan lines keep-with-next;";

function stripKeepWithNextStyles(styleValue) {
    return String(styleValue || "")
        .replace(/page-break-after\s*:\s*[^;]+;?/gi, "")
        .replace(/break-after\s*:\s*[^;]+;?/gi, "")
        .replace(/mso-pagination\s*:\s*[^;]+;?/gi, "")
        .replace(/;\s*;/g, ";")
        .replace(/^\s*;\s*|\s*;\s*$/g, "")
        .trim();
}

function buildRichTextClipboardHtml(previewArea) {
    const clone = previewArea.cloneNode(true);

    Array.from(clone.querySelectorAll("h1, h2, h3, h4, h5, h6")).forEach(heading => {
        const withoutKeepWithNext = stripKeepWithNextStyles(heading.getAttribute("style"));
        const nextStyle = withoutKeepWithNext
            ? `${withoutKeepWithNext}; ${COPY_HEADING_KEEP_WITH_NEXT_STYLE}`
            : COPY_HEADING_KEEP_WITH_NEXT_STYLE;

        // data-* attributes are not CSS-parsed, so mso-pagination survives serialization.
        heading.removeAttribute("style");
        heading.removeAttribute("data-mso-pagination");
        heading.setAttribute("data-copy-style", nextStyle);
    });

    return clone.outerHTML.replace(/\sdata-copy-style="([^"]*)"/g, ' style="$1"');
}

function copyRichText(previewArea) {
    const html = buildRichTextClipboardHtml(previewArea);
    const plain = previewArea.innerText;

    const onCopy = event => {
        event.preventDefault();
        event.clipboardData.setData("text/html", html);
        event.clipboardData.setData("text/plain", plain);
    };

    document.addEventListener("copy", onCopy);

    const range = document.createRange();
    range.selectNode(previewArea);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        const successful = document.execCommand("copy");
        selection.removeAllRanges();
        return successful;
    } catch (err) {
        selection.removeAllRanges();
        return false;
    } finally {
        document.removeEventListener("copy", onCopy);
    }
}
