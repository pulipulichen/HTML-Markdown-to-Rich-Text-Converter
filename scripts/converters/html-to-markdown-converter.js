const TABLE_STYLE_THEMES = {
    gray: {
        borderColor: "#B8C0C8",
        headerBackground: "#465362",
        secondaryHeaderBackground: "#687586",
        evenRowBackground: "#E9EDF1",
        oddRowBackground: "#FAFBFC",
        headerTextColor: "#FFFFFF",
        secondaryHeaderTextColor: "#FFFFFF",
        bodyTextColor: "#27313B"
    },
    blue: {
        borderColor: "#B9C9D6",
        headerBackground: "#244E73",
        secondaryHeaderBackground: "#3F6F99",
        evenRowBackground: "#E8F0F6",
        oddRowBackground: "#F7F9FB",
        headerTextColor: "#FFFFFF",
        secondaryHeaderTextColor: "#FFFFFF",
        bodyTextColor: "#243746"
    },
    yellow: {
        borderColor: "#D2BE8B",
        headerBackground: "#8A631D",
        secondaryHeaderBackground: "#B68422",
        evenRowBackground: "#F5EACD",
        oddRowBackground: "#FFFDF8",
        headerTextColor: "#FFFFFF",
        secondaryHeaderTextColor: "#FFFFFF",
        bodyTextColor: "#332E27"
    },
    red: {
        borderColor: "#D2B4B9",
        headerBackground: "#8E2F3F",
        secondaryHeaderBackground: "#A44652",
        evenRowBackground: "#F3E5E7",
        oddRowBackground: "#FCF9F9",
        headerTextColor: "#FFFFFF",
        secondaryHeaderTextColor: "#FFFFFF",
        bodyTextColor: "#3B2B2E"
    },
    green: {
        borderColor: "#B8CBC3",
        headerBackground: "#2F5D50",
        secondaryHeaderBackground: "#4F776B",
        evenRowBackground: "#E5EFEA",
        oddRowBackground: "#FAFCFB",
        headerTextColor: "#FFFFFF",
        secondaryHeaderTextColor: "#FFFFFF",
        bodyTextColor: "#24352F"
    },
    purple: {
        borderColor: "#CFC4D9",
        headerBackground: "#5B4778",
        secondaryHeaderBackground: "#76658E",
        evenRowBackground: "#EEE8F3",
        oddRowBackground: "#F5F2F8",
        headerTextColor: "#FFFFFF",
        secondaryHeaderTextColor: "#FFFFFF",
        bodyTextColor: "#3F3250"
    },
    brown: {
        borderColor: "#CDBEB4",
        headerBackground: "#6B4A3A",
        secondaryHeaderBackground: "#85614E",
        evenRowBackground: "#EEE6E0",
        oddRowBackground: "#FBF9F7",
        headerTextColor: "#FFFFFF",
        secondaryHeaderTextColor: "#FFFFFF",
        bodyTextColor: "#382F2A"
    }
};
const DEFAULT_TABLE_STYLE_THEME = "gray";
let currentTableStyleTheme = DEFAULT_TABLE_STYLE_THEME;
const DEFAULT_PREVIEW_FONT_FACE = "Microsoft JhengHei, Arial";
let currentPreviewFontFace = DEFAULT_PREVIEW_FONT_FACE;

function normalizeTableStyleTheme(theme) {
    return Object.hasOwn(TABLE_STYLE_THEMES, theme) ? theme : DEFAULT_TABLE_STYLE_THEME;
}

function getTableStyleTheme() {
    return currentTableStyleTheme;
}

function setTableStyleTheme(theme) {
    currentTableStyleTheme = normalizeTableStyleTheme(theme);
    return currentTableStyleTheme;
}

function getActiveTableStyle() {
    return TABLE_STYLE_THEMES[getTableStyleTheme()];
}

function getPreviewFontFace() {
    return currentPreviewFontFace || DEFAULT_PREVIEW_FONT_FACE;
}

function setPreviewFontFace(fontFace) {
    currentPreviewFontFace = String(fontFace || "").trim() || DEFAULT_PREVIEW_FONT_FACE;
    return currentPreviewFontFace;
}

window.getTableStyleTheme = getTableStyleTheme;
window.setTableStyleTheme = setTableStyleTheme;
window.getPreviewFontFace = getPreviewFontFace;
window.setPreviewFontFace = setPreviewFontFace;

function unwrapHtmlElement(element) {
    const parent = element.parentNode;
    if (!parent) {
        return;
    }

    while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }

    parent.removeChild(element);
}

function isBoldElement(node) {
    return node?.nodeType === Node.ELEMENT_NODE
        && (node.tagName === "STRONG" || node.tagName === "B");
}

function isIgnorableNodeBetweenBold(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) {
        return false;
    }

    return !node.textContent.replace(/\u00a0/g, " ").trim();
}

function unwrapNestedBoldElements(root) {
    let nested = root.querySelector("strong strong, strong b, b strong, b b");

    while (nested) {
        unwrapHtmlElement(nested);
        nested = root.querySelector("strong strong, strong b, b strong, b b");
    }
}

function mergeAdjacentBoldElements(root) {
    let changed = true;

    while (changed) {
        changed = false;

        Array.from(root.querySelectorAll("strong, b")).forEach(bold => {
            if (!bold.isConnected) {
                return;
            }

            let next = bold.nextSibling;
            while (isIgnorableNodeBetweenBold(next)) {
                next = next.nextSibling;
            }

            if (!isBoldElement(next)) {
                return;
            }

            let cursor = bold.nextSibling;
            while (cursor && cursor !== next) {
                const toMove = cursor;
                cursor = cursor.nextSibling;
                bold.appendChild(toMove);
            }

            while (next.firstChild) {
                bold.appendChild(next.firstChild);
            }

            next.remove();
            changed = true;
        });
    }
}

function removeEmptyBoldElements(root) {
    root.querySelectorAll("strong, b").forEach(element => {
        const text = element.textContent.replace(/\u00a0/g, " ").trim();
        if (!text) {
            element.remove();
        }
    });
}

function normalizeBoldElements(root) {
    unwrapNestedBoldElements(root);
    mergeAdjacentBoldElements(root);
    removeEmptyBoldElements(root);
}

function unwrapBlockElementsInListItems(root) {
    root.querySelectorAll("li").forEach(listItem => {
        const blocks = Array.from(listItem.children).filter(child => child.tagName === "P" || child.tagName === "DIV");

        if (blocks.length === 0) {
            return;
        }

        const fragment = document.createDocumentFragment();

        blocks.forEach((block, index) => {
            if (index > 0) {
                fragment.appendChild(document.createElement("br"));
            }

            while (block.firstChild) {
                fragment.appendChild(block.firstChild);
            }

            block.remove();
        });

        listItem.prepend(fragment);
    });
}

function preprocessHtmlForMarkdown(html) {
    const container = document.createElement("div");
    container.innerHTML = html.trim();
    unwrapBlockElementsInListItems(container);
    normalizeBoldElements(container);
    return container.innerHTML;
}

function convertHtmlToMarkdown(html, options = {}) {
    const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        emDelimiter: "*",
        bulletListMarker: "-"
    });

    if (window.turndownPluginGfm) {
        turndownService.use(window.turndownPluginGfm.gfm);
    }

    addMarkdownTableRule(turndownService, options);

    if (options.preserveTextColor) {
        addColoredTextRule(turndownService);
    }

    return turndownService.turndown(preprocessHtmlForMarkdown(html));
}

window.convertHtmlToMarkdown = convertHtmlToMarkdown;

const DEFAULT_TEXT_COLORS = new Set([
    "#000",
    "#000000",
    "#111",
    "#111111",
    "#222",
    "#222222",
    "#27313b",
    "#243746",
    "black",
    "windowtext",
    "currentcolor",
    "inherit",
    "initial"
]);

function normalizeCssColor(color) {
    return String(color || "").trim().toLowerCase().replace(/\s+/g, "");
}

function isDefaultTextColor(color) {
    return DEFAULT_TEXT_COLORS.has(normalizeCssColor(color));
}

function extractInlineColor(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        return "";
    }

    const attributeColor = node.getAttribute("color");
    if (attributeColor && !isDefaultTextColor(attributeColor)) {
        return attributeColor.trim();
    }

    const styleColor = node.getAttribute("style")?.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    if (styleColor && !isDefaultTextColor(styleColor[1])) {
        return styleColor[1].trim();
    }

    return "";
}

function addColoredTextRule(turndownService) {
    const filter = node => Boolean(extractInlineColor(node));

    turndownService.addRule("coloredText", {
        filter,
        replacement: (content, node) => {
            const color = extractInlineColor(node);
            if (!color || !content.trim()) {
                return content;
            }

            return `<span style="color: ${color}">${content}</span>`;
        }
    });
}

function addMarkdownTableRule(turndownService, options = {}) {
    turndownService.addRule("markdownTables", {
        filter: "table",
        replacement: (content, node) => {
            const markdownTable = convertTableNodeToMarkdown(node, turndownService, options);
            return `\n\n${markdownTable}\n\n`;
        }
    });
}

function extractPlainTextWithLineBreaks(element) {
    const BLOCK_TAGS = new Set([
        "P", "DIV", "PRE", "LI", "H1", "H2", "H3", "H4", "H5", "H6",
        "O:P", "TR", "BLOCKQUOTE"
    ]);

    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent.replace(/\u00a0/g, " ");
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return "";
        }

        if (node.nodeName === "BR") {
            return "\n";
        }

        const childText = Array.from(node.childNodes).map(walk).join("");

        return BLOCK_TAGS.has(node.nodeName) ? `${childText}\n` : childText;
    }

    return walk(element)
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function convertSingleCellTableToCodeBlock(cell) {
    const content = extractPlainTextWithLineBreaks(cell.cloneNode(true));

    return `\`\`\`\n${content}\n\`\`\``;
}

function convertTableNodeToMarkdown(table, turndownService, options = {}) {
    const tableRows = Array.from(table.rows);

    if (tableRows.length === 1 && tableRows[0].cells.length === 1) {
        return convertSingleCellTableToCodeBlock(tableRows[0].cells[0]);
    }

    if (table.querySelector("[rowspan], [colspan]")) {
        const tableClone = table.cloneNode(true);

        if (!options.skipTableStyles) {
            applyWordTableStyles(tableClone);
        }

        return tableClone.outerHTML.trim();
    }

    const rows = Array.from(table.rows)
        .map(row => Array.from(row.cells).map(cell => convertTableCellToMarkdown(cell, turndownService)))
        .filter(row => row.length > 0);

    if (rows.length === 0) {
        return "";
    }

    const columnCount = Math.max(...rows.map(row => row.length));
    const normalizedRows = rows.map(row => padTableRow(row, columnCount));
    const headerRow = normalizedRows[0].map((cell, index) => cell || `欄位 ${index + 1}`);
    const dividerRow = Array(columnCount).fill("---");
    const bodyRows = normalizedRows.slice(1);

    return [headerRow, dividerRow, ...bodyRows]
        .map(row => `| ${row.join(" | ")} |`)
        .join("\n");
}

function convertTableCellToMarkdown(cell, turndownService) {
    const cellClone = cell.cloneNode(true);

    cellClone.querySelectorAll("br").forEach(br => {
        br.replaceWith(document.createTextNode("<br>"));
    });

    return turndownService.turndown(cellClone.innerHTML)
        .replace(/\r?\n\s*\r?\n/g, "<br>")
        .replace(/\r?\n/g, "<br>")
        .replace(/\|/g, "\\|")
        .trim();
}

function padTableRow(row, columnCount) {
    return row.concat(Array(Math.max(columnCount - row.length, 0)).fill(""));
}

function applyWordTableStyles(container) {
    const tables = container.matches?.("table") ? [container] : Array.from(container.querySelectorAll("table"));
    const tableStyle = getActiveTableStyle();

    tables.forEach(table => {
        if (table.hasAttribute("data-code-block-table")) {
            return;
        }

        table.removeAttribute("style");
        table.setAttribute("border", "1");
        table.setAttribute("cellspacing", "0");
        table.setAttribute("cellpadding", "0");
        table.setAttribute("width", "100%");
        table.setAttribute("bordercolor", tableStyle.borderColor);

        Array.from(table.rows).forEach((row, rowIndex) => {
            const isHeaderRow = rowIndex === 0;
            const isEvenBodyRow = rowIndex > 0 && rowIndex % 2 === 0;
            let backgroundColor = tableStyle.oddRowBackground;
            if (isHeaderRow) {
                backgroundColor = tableStyle.headerBackground;
            } else if (isEvenBodyRow) {
                backgroundColor = tableStyle.evenRowBackground;
            }

            row.removeAttribute("style");
            row.setAttribute("bgcolor", backgroundColor);

            Array.from(row.cells).forEach((cell, cellIndex) => {
                const align = cell.getAttribute("align") || getStyleTextAlign(cell) || "left";

                cell.removeAttribute("style");
                cell.setAttribute("bgcolor", backgroundColor);
                cell.setAttribute("align", align);
                cell.setAttribute("valign", "top");

                if (isHeaderRow) {
                    wrapCellContent(cell, tableStyle.headerTextColor, true, true);
                    return;
                }

                wrapCellContent(cell, tableStyle.bodyTextColor, false, cellIndex === 0);
            });
        });

        table.querySelectorAll("[style]").forEach(element => {
            element.removeAttribute("style");
        });

        // Keep table rows at single line spacing in rich text output.
        table.style.lineHeight = "1";

        // Ensure the first row is treated as repeatable header in paged outputs.
        const tableHead = ensureRepeatableTableHeader(table);
        if (tableHead) {
            tableHead.style.display = "table-header-group";
        }

        Array.from(table.querySelectorAll("td, th")).forEach(cell => {
            cell.style.padding = "2px 6px";
        });
    });
}

function ensureRepeatableTableHeader(table) {
    if (table.tHead) {
        return table.tHead;
    }

    const firstRow = table.rows[0];
    if (!firstRow) {
        return null;
    }

    const thead = table.ownerDocument.createElement("thead");
    const headerRow = firstRow.cloneNode(true);

    Array.from(headerRow.cells).forEach(cell => {
        if (cell.tagName === "TH") {
            return;
        }

        const th = table.ownerDocument.createElement("th");
        Array.from(cell.attributes).forEach(attribute => {
            th.setAttribute(attribute.name, attribute.value);
        });
        th.innerHTML = cell.innerHTML;
        cell.replaceWith(th);
    });

    thead.appendChild(headerRow);
    firstRow.remove();
    table.insertBefore(thead, table.firstChild);

    return thead;
}

function getStyleTextAlign(cell) {
    const match = cell.getAttribute("style")?.match(/text-align\s*:\s*([^;]+)/i);

    return match ? match[1].trim() : "";
}

function wrapCellContent(cell, color, isBold, isItalic, fontSize) {
    let content = cell.innerHTML;

    if (isItalic) {
        content = `<i>${content}</i>`;
    }

    if (isBold) {
        content = `<b>${content}</b>`;
    }

    const sizeStyle = fontSize ? ` style="font-size: ${fontSize}pt"` : "";
    cell.innerHTML = `<font color="${color}" face="${getPreviewFontFace()}"${sizeStyle}>${content}</font>`;
}
