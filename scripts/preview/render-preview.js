const DEFAULT_TOP_HEADING_LEVEL = 2;
const DEFAULT_RICH_TEXT_FORMAT = "sop";

function updatePreview(
    markdownInput,
    previewArea,
    topHeadingLevel = DEFAULT_TOP_HEADING_LEVEL,
    richTextFormat = DEFAULT_RICH_TEXT_FORMAT,
    codeBlockToTable = false
) {
    let rawValue = markdownInput.value;
    rawValue = filterMarkdown(rawValue);

    previewArea.innerHTML = marked.parse(rawValue);
    normalizeHeadingLevels(previewArea, topHeadingLevel);

    if (codeBlockToTable) {
        convertCodeBlocksToSingleCellTables(previewArea);
    }

    applyRichTextFormat(previewArea, richTextFormat);
}

function convertCodeBlocksToSingleCellTables(container) {
    Array.from(container.querySelectorAll("pre")).forEach(pre => {
        const code = pre.querySelector("code");
        const text = (code || pre).textContent.replace(/\u00a0/g, " ") || "";
        const lines = text.split("\n");

        if (lines.length > 1 && lines[lines.length - 1] === "") {
            lines.pop();
        }

        const table = document.createElement("table");
        table.setAttribute("data-code-block-table", "true");

        const row = table.insertRow();
        const cell = row.insertCell();
        cell.innerHTML = lines.map(escapeHtml).join("<br>");

        pre.replaceWith(table);
        table.after(document.createElement("br"));
    });
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function normalizeHeadingLevels(container, topHeadingLevel) {
    const headings = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    if (headings.length === 0) {
        return;
    }

    const targetTopLevel = normalizeTopHeadingLevel(topHeadingLevel);
    const topLevel = Math.min(...headings.map(getHeadingLevel));
    const offset = targetTopLevel - topLevel;

    headings.forEach(heading => {
        const nextLevel = Math.min(6, Math.max(1, getHeadingLevel(heading) + offset));
        if (nextLevel === getHeadingLevel(heading)) {
            return;
        }

        const replacement = document.createElement(`h${nextLevel}`);
        Array.from(heading.attributes).forEach(attribute => {
            replacement.setAttribute(attribute.name, attribute.value);
        });
        replacement.innerHTML = heading.innerHTML;
        heading.replaceWith(replacement);
    });
}

function getHeadingLevel(heading) {
    return Number(heading.tagName.slice(1));
}

function normalizeTopHeadingLevel(level) {
    const normalizedLevel = Number(level);
    if (!Number.isInteger(normalizedLevel) || normalizedLevel < 1 || normalizedLevel > 6) {
        return DEFAULT_TOP_HEADING_LEVEL;
    }

    return normalizedLevel;
}

function applyRichTextFormat(container, richTextFormat) {
    if (richTextFormat === "plain") {
        applyPlainTableStyles(container);
        return;
    }

    applyWordTableStyles(container);
    applyPlainCodeBlockTableStyles(container);
}

function applyPlainCodeBlockTableStyles(container) {
    const tables = Array.from(container.querySelectorAll('table[data-code-block-table="true"]'));
    const tableStyle = getActiveTableStyle();
    const codeBlockTableBackgroundColor = "#f3f4f6";

    tables.forEach(table => {
        table.removeAttribute("style");
        table.setAttribute("border", "1");
        table.setAttribute("cellspacing", "0");
        table.setAttribute("cellpadding", "6");
        table.setAttribute("width", "100%");
        table.setAttribute("bordercolor", tableStyle.borderColor);
        table.style.backgroundColor = codeBlockTableBackgroundColor;
        table.style.lineHeight = "1";

        Array.from(table.rows).forEach(row => {
            row.removeAttribute("style");
            row.setAttribute("bgcolor", codeBlockTableBackgroundColor);

            Array.from(row.cells).forEach(cell => {
                cell.removeAttribute("style");
                cell.setAttribute("bgcolor", codeBlockTableBackgroundColor);
                cell.setAttribute("align", "left");
                cell.setAttribute("valign", "top");
                cell.innerHTML = `<font color="#000000" face="Consolas, monospace">${cell.innerHTML}</font>`;
            });
        });

        table.querySelectorAll("[style]").forEach(element => {
            element.removeAttribute("style");
        });

        const borderColor = tableStyle.borderColor;
        table.style.borderColor = borderColor;
        Array.from(table.querySelectorAll("td, th")).forEach(cell => {
            cell.style.border = `1px solid ${borderColor}`;
            cell.style.backgroundColor = codeBlockTableBackgroundColor;
            cell.style.lineHeight = "1";
        });
    });
}

function applyPlainTableStyles(container) {
    const tables = container.matches?.("table") ? [container] : Array.from(container.querySelectorAll("table"));

    tables.forEach(table => {
        table.removeAttribute("style");
        table.setAttribute("border", "1");
        table.setAttribute("cellspacing", "0");
        table.setAttribute("cellpadding", "6");
        table.setAttribute("width", "100%");
        table.setAttribute("bordercolor", "#000000");

        Array.from(table.rows).forEach(row => {
            row.removeAttribute("style");
            row.removeAttribute("bgcolor");

            Array.from(row.cells).forEach(cell => {
                const align = cell.getAttribute("align") || getCellStyleTextAlign(cell) || "left";

                cell.removeAttribute("style");
                cell.removeAttribute("bgcolor");
                cell.setAttribute("align", align);
                cell.setAttribute("valign", "top");
            });
        });

        table.querySelectorAll("[style]").forEach(element => {
            element.removeAttribute("style");
        });
    });
}

function getCellStyleTextAlign(cell) {
    const match = cell.getAttribute("style")?.match(/text-align\s*:\s*([^;]+)/i);
    return match ? match[1].trim() : "";
}
