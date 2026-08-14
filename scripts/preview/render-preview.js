const DEFAULT_TOP_HEADING_LEVEL = 2;
const DEFAULT_RICH_TEXT_FORMAT = "sop";
const DEFAULT_PARAGRAPH_LINE_HEIGHT = "1.5";
const VALID_PARAGRAPH_LINE_HEIGHTS = ["1", "1.15", "1.5"];
// Browser-safe keep-with-next styles. Word-oriented mso-pagination is injected at copy time
// because Chromium's CSSOM strips unknown properties from live style attributes.
const HEADING_KEEP_WITH_NEXT_STYLE = "page-break-after: avoid; break-after: avoid-page;";
const HEADING_MSO_PAGINATION = "widow-orphan lines keep-with-next";

const SLIDE_TABLE_PADDING = "2px";
const DEFAULT_SLIDE_TABLE_FONT_SIZE = "18";
const DEFAULT_SLIDE_TEXT_FONT_SIZE = "20";
const DEFAULT_SLIDE_LINE_HEIGHT = "1.15";
const DEFAULT_SLIDE_HEADER_TYPE = "both-primary";
const DEFAULT_SLIDE_TABLE_WIDTH = "full";
const SLIDE_TABLE_WIDTH_PX = {
    full: "960",
    half: "450"
};
const DEFAULT_SLIDE_TABLE_HEIGHT = "full";
const SLIDE_TABLE_HEIGHT_PX = {
    full: "420",
    half: "210"
};
const DEFAULT_SLIDE_TABLE_OPTIONS = {
    headerType: DEFAULT_SLIDE_HEADER_TYPE,
    tableFontSize: DEFAULT_SLIDE_TABLE_FONT_SIZE,
    textFontSize: DEFAULT_SLIDE_TEXT_FONT_SIZE,
    applyTableColorsToText: false,
    lineHeight: DEFAULT_SLIDE_LINE_HEIGHT,
    tableWidth: DEFAULT_SLIDE_TABLE_WIDTH,
    tableHeight: DEFAULT_SLIDE_TABLE_HEIGHT
};

function updatePreview(
    markdownInput,
    previewArea,
    topHeadingLevel = DEFAULT_TOP_HEADING_LEVEL,
    richTextFormat = DEFAULT_RICH_TEXT_FORMAT,
    codeBlockToTable = false,
    removeHeadingBold = true,
    paragraphLineHeight = DEFAULT_PARAGRAPH_LINE_HEIGHT,
    blankLineAfterTables = true,
    slideTableOptions = DEFAULT_SLIDE_TABLE_OPTIONS
) {
    const isSlideFormat = richTextFormat === "slide-16-9";
    let rawValue = markdownInput.value;
    rawValue = filterMarkdown(rawValue);

    previewArea.innerHTML = marked.parse(rawValue);
    convertTableCellBrBulletsToLists(previewArea);
    trimTrailingEmptyTableEdges(previewArea);
    mergeTrailingEmptyTableCells(previewArea);

    if (!isSlideFormat) {
        normalizeHeadingLevels(previewArea, topHeadingLevel);
    }

    if (removeHeadingBold) {
        removeBoldFormattingFromHeadings(previewArea);
    }

    if (codeBlockToTable) {
        convertCodeBlocksToSingleCellTables(previewArea);
    }

    applyRichTextFormat(previewArea, richTextFormat, slideTableOptions);
    applyParagraphLineHeightStyles(
        previewArea,
        isSlideFormat ? (slideTableOptions?.lineHeight || DEFAULT_SLIDE_LINE_HEIGHT) : paragraphLineHeight
    );

    if (isSlideFormat) {
        applySlideTextStyles(previewArea, slideTableOptions);
    } else {
        resetSlideTextStyles(previewArea);
    }

    applyHeadingKeepWithNextStyles(previewArea);

    if (blankLineAfterTables) {
        ensureTrailingBreakAfterTables(previewArea);
    }
}

function removeBoldFormattingFromHeadings(container) {
    const headings = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"));

    headings.forEach(heading => {
        Array.from(heading.querySelectorAll("strong, b")).forEach(boldElement => {
            boldElement.replaceWith(...boldElement.childNodes);
        });

        Array.from(heading.querySelectorAll("[style]")).forEach(element => {
            const style = element.getAttribute("style");
            if (!style || !/font-weight\s*:/i.test(style)) {
                return;
            }

            const nextStyle = style
                .replace(/font-weight\s*:\s*[^;]+;?/gi, "")
                .replace(/;\s*;/g, ";")
                .replace(/^\s*;\s*|\s*;\s*$/g, "")
                .trim();

            if (nextStyle) {
                element.setAttribute("style", nextStyle);
            } else {
                element.removeAttribute("style");
            }
        });
    });
}

function normalizeParagraphLineHeight(lineHeight) {
    const value = String(lineHeight);
    return VALID_PARAGRAPH_LINE_HEIGHTS.includes(value) ? value : DEFAULT_PARAGRAPH_LINE_HEIGHT;
}

function applyParagraphLineHeightStyles(container, lineHeight) {
    const normalizedLineHeight = normalizeParagraphLineHeight(lineHeight);

    Array.from(container.querySelectorAll("p, li")).forEach(element => {
        element.style.lineHeight = normalizedLineHeight;
    });
}

function applyHeadingKeepWithNextStyles(container) {
    Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).forEach(heading => {
        const currentStyle = heading.getAttribute("style") || "";
        const withoutKeepWithNext = currentStyle
            .replace(/page-break-after\s*:\s*[^;]+;?/gi, "")
            .replace(/break-after\s*:\s*[^;]+;?/gi, "")
            .replace(/mso-pagination\s*:\s*[^;]+;?/gi, "")
            .replace(/;\s*;/g, ";")
            .replace(/^\s*;\s*|\s*;\s*$/g, "")
            .trim();
        const nextStyle = withoutKeepWithNext
            ? `${withoutKeepWithNext}; ${HEADING_KEEP_WITH_NEXT_STYLE}`
            : HEADING_KEEP_WITH_NEXT_STYLE;
        heading.setAttribute("style", nextStyle);
        heading.setAttribute("data-mso-pagination", HEADING_MSO_PAGINATION);
    });
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
    });
}

function ensureTrailingBreakAfterTables(container) {
    Array.from(container.querySelectorAll("table")).forEach(table => {
        const next = table.nextSibling;
        if (next && next.nodeName === "BR") {
            return;
        }

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

function applyRichTextFormat(container, richTextFormat, slideTableOptions = DEFAULT_SLIDE_TABLE_OPTIONS) {
    if (richTextFormat === "plain") {
        applyPlainTableStyles(container);
        return;
    }

    if (richTextFormat === "slide-16-9") {
        applySlideTableStyles(container, slideTableOptions);
        return;
    }

    if (richTextFormat === "gmail-printable") {
        applyWordTableStyles(container);
        applyPlainCodeBlockTableStyles(container);
        return;
    }

    applyWordTableStyles(container);
    applyPlainCodeBlockTableStyles(container);
}

function normalizeSlideHeaderType(headerType) {
    if (headerType === "column-primary" || headerType === "row-primary" || headerType === "both-primary") {
        return headerType;
    }

    return DEFAULT_SLIDE_HEADER_TYPE;
}

function normalizeSlideFontSize(fontSize, defaultSize = DEFAULT_SLIDE_TABLE_FONT_SIZE) {
    const value = String(fontSize);
    return ["12", "14", "16", "18", "20", "22", "24"].includes(value) ? value : defaultSize;
}

function normalizeSlideTableWidth(tableWidth) {
    if (tableWidth === "auto" || Object.hasOwn(SLIDE_TABLE_WIDTH_PX, tableWidth)) {
        return tableWidth;
    }

    return DEFAULT_SLIDE_TABLE_WIDTH;
}

function resolveSlideTableWidthPx(tableWidth) {
    const normalizedWidth = normalizeSlideTableWidth(tableWidth);
    return normalizedWidth === "auto" ? null : SLIDE_TABLE_WIDTH_PX[normalizedWidth];
}

function normalizeSlideTableHeight(tableHeight) {
    if (tableHeight === "auto" || Object.hasOwn(SLIDE_TABLE_HEIGHT_PX, tableHeight)) {
        return tableHeight;
    }

    return DEFAULT_SLIDE_TABLE_HEIGHT;
}

function resolveSlideTableHeightPx(tableHeight) {
    const normalizedHeight = normalizeSlideTableHeight(tableHeight);
    return normalizedHeight === "auto" ? null : SLIDE_TABLE_HEIGHT_PX[normalizedHeight];
}

function getSlideHeaderRole(rowIndex, cellIndex, headerType) {
    const isFirstRow = rowIndex === 0;
    const isFirstColumn = cellIndex === 0;

    if (!isFirstRow && !isFirstColumn) {
        return "body";
    }

    if (isFirstRow && isFirstColumn) {
        return "primary";
    }

    if (headerType === "both-primary") {
        return "primary";
    }

    if (headerType === "column-primary") {
        return isFirstColumn ? "primary" : "secondary";
    }

    // row-primary
    return isFirstRow ? "primary" : "secondary";
}

function isOutsideSlideTable(element) {
    return !element.closest("table");
}

function resetSlideTextStyles(container) {
    if (!container) {
        return;
    }

    // Restore SOP/Plain body size after Slide overrides the preview container font-size.
    container.style.fontSize = "12pt";
    delete container.dataset.slideTextFontSize;
    delete container.dataset.slideTableFontSize;
}

function applySlideTextStyles(container, options = DEFAULT_SLIDE_TABLE_OPTIONS) {
    const textFontSize = normalizeSlideFontSize(
        options?.textFontSize ?? options?.fontSize,
        DEFAULT_SLIDE_TEXT_FONT_SIZE
    );
    const applyTableColorsToText = Boolean(options?.applyTableColorsToText);
    const tableStyle = getActiveTableStyle();
    const bodyTextColor = tableStyle.bodyTextColor;
    const emphasisColor = tableStyle.headerBackground;
    const listItemMarginBottom = `${Number(textFontSize) * 0.5}pt`;

    container.style.fontSize = `${textFontSize}pt`;
    container.dataset.slideTextFontSize = textFontSize;
    container.dataset.slideTableFontSize = normalizeSlideFontSize(
        options?.tableFontSize ?? options?.fontSize,
        DEFAULT_SLIDE_TABLE_FONT_SIZE
    );

    Array.from(container.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6")).forEach(element => {
        if (!isOutsideSlideTable(element)) {
            return;
        }

        element.style.fontSize = `${textFontSize}pt`;

        if (applyTableColorsToText) {
            element.style.color = bodyTextColor;
        }
    });

    Array.from(container.querySelectorAll("li")).forEach(listItem => {
        if (!isOutsideSlideTable(listItem)) {
            return;
        }

        listItem.style.marginBottom = listItemMarginBottom;
    });

    if (!applyTableColorsToText) {
        return;
    }

    Array.from(container.querySelectorAll("strong, b")).forEach(boldElement => {
        if (!isOutsideSlideTable(boldElement)) {
            return;
        }

        boldElement.style.color = emphasisColor;
        boldElement.style.fontWeight = "bold";

        if (boldElement.querySelector(":scope > font[data-slide-emphasis='true']")) {
            return;
        }

        const content = boldElement.innerHTML;
        boldElement.innerHTML = `<font data-slide-emphasis="true" color="${emphasisColor}" face="${getPreviewFontFace()}" style="font-size: ${textFontSize}pt; font-weight: bold;">${content}</font>`;
    });

    Array.from(container.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6")).forEach(element => {
        if (!isOutsideSlideTable(element)) {
            return;
        }

        if (element.querySelector(":scope > font[data-slide-body-text='true']")) {
            return;
        }

        const content = element.innerHTML;
        element.innerHTML = `<font data-slide-body-text="true" color="${bodyTextColor}" face="${getPreviewFontFace()}" style="font-size: ${textFontSize}pt">${content}</font>`;
    });
}

function extractBulletLineContent(htmlFragment) {
    const trimmed = String(htmlFragment || "")
        .replace(/^(?:&nbsp;|\s)+/i, "")
        .replace(/(?:&nbsp;|\s)+$/i, "")
        .trim();

    if (!trimmed) {
        return null;
    }

    const match = trimmed.match(/^(?:[-*•]|\u2022)\s+([\s\S]+)$/);
    return match ? match[1].trim() : null;
}

function convertTableCellBrBulletsToLists(container) {
    Array.from(container.querySelectorAll("td, th")).forEach(cell => {
        if (cell.closest('table[data-code-block-table="true"]')) {
            return;
        }

        convertCellBrBulletsToList(cell);
    });
}

function isTableCellEmpty(cell) {
    const text = (cell.textContent || "").replace(/\u00a0/g, " ").trim();
    if (text) {
        return false;
    }

    const html = (cell.innerHTML || "")
        .replace(/<br\s*\/?>/gi, "")
        .replace(/&nbsp;/gi, "")
        .replace(/\s+/g, "")
        .trim();

    return html === "";
}

/**
 * Drop fully empty trailing rows (from the bottom) and fully empty trailing
 * columns (from the right) before other table cell transforms run.
 */
function trimTrailingEmptyTableEdges(container) {
    Array.from(container.querySelectorAll("table")).forEach(table => {
        if (table.hasAttribute("data-code-block-table")) {
            return;
        }

        trimTrailingEmptyRows(table);
        trimTrailingEmptyColumns(table);
    });
}

function isTableRowEmpty(row) {
    const cells = Array.from(row.cells);
    return cells.length === 0 || cells.every(isTableCellEmpty);
}

function trimTrailingEmptyRows(table) {
    // Keep the header row even if somehow empty.
    while (table.rows.length > 1) {
        const lastRow = table.rows[table.rows.length - 1];
        if (!isTableRowEmpty(lastRow)) {
            break;
        }

        lastRow.remove();
    }
}

function trimTrailingEmptyColumns(table) {
    while (true) {
        const rows = Array.from(table.rows);
        if (rows.length === 0) {
            return;
        }

        const columnCount = Math.min(...rows.map(row => row.cells.length));
        if (columnCount <= 1) {
            return;
        }

        const lastColumnIndex = columnCount - 1;
        const columnIsEmpty = rows.every(row => isTableCellEmpty(row.cells[lastColumnIndex]));
        if (!columnIsEmpty) {
            return;
        }

        rows.forEach(row => {
            if (row.cells.length > lastColumnIndex) {
                row.cells[lastColumnIndex].remove();
            }
        });
    }
}

/**
 * When a body row has exactly one non-first cell with content and every cell to
 * its right is empty, merge those empty cells into the filled cell via colspan.
 * The first column is never merged away.
 */
function mergeTrailingEmptyTableCells(container) {
    Array.from(container.querySelectorAll("table")).forEach(table => {
        if (table.hasAttribute("data-code-block-table")) {
            return;
        }

        Array.from(table.rows).forEach((row, rowIndex) => {
            // Keep header columns intact so column labels stay aligned.
            if (rowIndex === 0) {
                return;
            }

            mergeTrailingEmptyNonFirstCellsInRow(row);
        });
    });
}

function mergeTrailingEmptyNonFirstCellsInRow(row) {
    const cells = Array.from(row.cells);
    if (cells.length < 3) {
        return;
    }

    const nonFirstCells = cells.slice(1);
    const filledRelativeIndexes = [];

    nonFirstCells.forEach((cell, index) => {
        if (!isTableCellEmpty(cell)) {
            filledRelativeIndexes.push(index);
        }
    });

    if (filledRelativeIndexes.length !== 1) {
        return;
    }

    const filledRelativeIndex = filledRelativeIndexes[0];
    if (filledRelativeIndex === nonFirstCells.length - 1) {
        return;
    }

    const filledAbsoluteIndex = filledRelativeIndex + 1;
    const span = cells.length - filledAbsoluteIndex;
    if (span < 2) {
        return;
    }

    const filledCell = cells[filledAbsoluteIndex];
    for (let index = cells.length - 1; index > filledAbsoluteIndex; index -= 1) {
        cells[index].remove();
    }

    filledCell.setAttribute("colspan", String(span));
}

function convertCellBrBulletsToList(cell) {
    if (!cell || cell.querySelector("ul, ol")) {
        return Boolean(cell?.querySelector("ul, ol"));
    }

    const parts = cell.innerHTML
        .split(/<br\s*\/?>/i)
        .map(part => part.trim())
        .filter(Boolean);

    if (parts.length === 0) {
        return false;
    }

    const segments = [];
    let bulletItems = null;
    let convertedAny = false;

    const flushBullets = () => {
        if (!bulletItems || bulletItems.length === 0) {
            bulletItems = null;
            return;
        }

        segments.push({ type: "list", items: bulletItems });
        bulletItems = null;
        convertedAny = true;
    };

    parts.forEach(part => {
        const bulletContent = extractBulletLineContent(part);
        if (bulletContent !== null) {
            if (!bulletItems) {
                bulletItems = [];
            }

            bulletItems.push(bulletContent);
            return;
        }

        flushBullets();
        segments.push({ type: "text", html: part });
    });
    flushBullets();

    if (!convertedAny) {
        return false;
    }

    // Avoid <br> next to <ul>: lists are already block-level, so a trailing/leading
    // <br> shows up as an extra blank line (e.g. after the last bullet).
    cell.innerHTML = segments.reduce((html, segment, index) => {
        const piece = segment.type === "list"
            ? `<ul>${segment.items.map(item => `<li>${item}</li>`).join("")}</ul>`
            : segment.html;

        if (index === 0) {
            return piece;
        }

        const prev = segments[index - 1];
        const needsBr = prev.type === "text" && segment.type === "text";
        return needsBr ? `${html}<br>${piece}` : `${html}${piece}`;
    }, "");

    Array.from(cell.querySelectorAll("ul")).forEach(list => {
        list.style.margin = "0";
        list.style.paddingLeft = "1.25em";
    });

    return true;
}

function styleSlideTableListCell(cell, fontSize) {
    const listMargin = `${Number(fontSize) * 0.5}pt`;

    cell.setAttribute("align", "left");
    cell.style.textAlign = "left";

    Array.from(cell.querySelectorAll("ul, ol")).forEach(list => {
        list.style.textAlign = "left";
        list.style.margin = "0";
        list.style.paddingLeft = "1.25em";
        list.style.listStylePosition = "outside";
    });

    Array.from(cell.querySelectorAll("li")).forEach(listItem => {
        listItem.style.textAlign = "left";
        listItem.style.marginTop = listMargin;
        listItem.style.marginBottom = listMargin;
    });
}

function applySlideTableStyles(container, options = DEFAULT_SLIDE_TABLE_OPTIONS) {
    const tables = container.matches?.("table") ? [container] : Array.from(container.querySelectorAll("table"));
    const tableStyle = getActiveTableStyle();
    const headerType = normalizeSlideHeaderType(options?.headerType);
    const fontSize = normalizeSlideFontSize(
        options?.tableFontSize ?? options?.fontSize,
        DEFAULT_SLIDE_TABLE_FONT_SIZE
    );
    const tableWidthKey = normalizeSlideTableWidth(options?.tableWidth);
    const tableWidthPx = resolveSlideTableWidthPx(tableWidthKey);
    const tableHeightKey = normalizeSlideTableHeight(options?.tableHeight);
    const tableHeightPx = resolveSlideTableHeightPx(tableHeightKey);
    const secondaryHeaderBackground = tableStyle.secondaryHeaderBackground || tableStyle.headerBackground;
    const secondaryHeaderTextColor = tableStyle.secondaryHeaderTextColor || tableStyle.headerTextColor;

    tables.forEach(table => {
        table.removeAttribute("style");
        table.removeAttribute("width");
        table.removeAttribute("height");
        table.setAttribute("data-slide-table", "true");
        table.setAttribute("data-slide-table-width", tableWidthKey);
        table.setAttribute("data-slide-table-height", tableHeightKey);
        table.setAttribute("border", "1");
        table.setAttribute("cellspacing", "0");
        table.setAttribute("cellpadding", "0");
        table.setAttribute("bordercolor", tableStyle.borderColor);
        table.style.lineHeight = "1";
        table.style.borderCollapse = "collapse";
        table.style.fontSize = `${fontSize}pt`;

        if (tableWidthPx) {
            table.setAttribute("width", tableWidthPx);
            table.style.width = `${tableWidthPx}px`;
        } else {
            table.style.width = "auto";
        }

        if (tableHeightPx) {
            table.setAttribute("height", tableHeightPx);
            table.style.height = `${tableHeightPx}px`;
        }

        const rowCount = table.rows.length;
        // Slide header types always treat the first row as a header (primary or secondary).
        const firstRowIsHeader = rowCount > 0;
        const headerRowHeightPx = firstRowIsHeader
            ? String(Math.round(Number(fontSize) * 1.5))
            : null;
        const bodyRowCount = firstRowIsHeader ? Math.max(rowCount - 1, 0) : rowCount;
        const remainingHeightPx = tableHeightPx && firstRowIsHeader
            ? Math.max(Number(tableHeightPx) - Number(headerRowHeightPx), 0)
            : Number(tableHeightPx || 0);
        const bodyRowHeightPx = tableHeightPx && bodyRowCount > 0
            ? String(Math.floor(remainingHeightPx / bodyRowCount))
            : (tableHeightPx && rowCount > 0 ? String(Math.floor(Number(tableHeightPx) / rowCount)) : null);

        Array.from(table.rows).forEach((row, rowIndex) => {
            const isHeaderRow = rowIndex === 0;
            const zebraIndex = rowIndex - 1;
            const isEvenBodyRow = !isHeaderRow && zebraIndex % 2 === 1;
            const rowBackground = isHeaderRow
                ? tableStyle.headerBackground
                : (isEvenBodyRow ? tableStyle.evenRowBackground : tableStyle.oddRowBackground);
            const currentRowHeightPx = tableHeightPx
                ? (isHeaderRow && firstRowIsHeader ? headerRowHeightPx : bodyRowHeightPx)
                : null;

            row.removeAttribute("style");
            row.removeAttribute("height");
            row.setAttribute("bgcolor", rowBackground);
            row.style.backgroundColor = rowBackground;

            if (currentRowHeightPx) {
                row.setAttribute("height", currentRowHeightPx);
                row.style.height = `${currentRowHeightPx}px`;
            }

            Array.from(row.cells).forEach((cell, cellIndex) => {
                const headerRole = getSlideHeaderRole(rowIndex, cellIndex, headerType);
                const isHeaderCell = headerRole !== "body";
                let backgroundColor = rowBackground;
                let textColor = tableStyle.bodyTextColor;

                if (headerRole === "primary") {
                    backgroundColor = tableStyle.headerBackground;
                    textColor = tableStyle.headerTextColor;
                } else if (headerRole === "secondary") {
                    backgroundColor = secondaryHeaderBackground;
                    textColor = secondaryHeaderTextColor;
                }

                const isFirstColumnHeader = cellIndex === 0 && isHeaderCell;
                const isFirstRowHeader = rowIndex === 0 && isHeaderCell;
                const isAutoWidth = tableWidthKey === "auto";
                const isAutoHeight = tableHeightKey === "auto";
                const extraPadding = `${Number(fontSize) * 0.5}pt`;
                // Auto size: give every cell comfortable padding on the free axis
                // (same extra as header cells: 0.5 × table font size).
                const verticalPadding = isFirstRowHeader || isAutoHeight
                    ? `calc(${SLIDE_TABLE_PADDING} + ${extraPadding})`
                    : SLIDE_TABLE_PADDING;
                const horizontalPadding = isFirstColumnHeader || isAutoWidth
                    ? `calc(${SLIDE_TABLE_PADDING} + ${extraPadding})`
                    : SLIDE_TABLE_PADDING;

                const hasBulletList = convertCellBrBulletsToList(cell);

                cell.removeAttribute("style");
                cell.removeAttribute("height");
                cell.setAttribute("bgcolor", backgroundColor);
                cell.setAttribute("align", hasBulletList ? "left" : "center");
                cell.setAttribute("valign", "middle");
                cell.style.backgroundColor = backgroundColor;
                cell.style.padding = `${verticalPadding} ${horizontalPadding}`;
                cell.style.border = `1px solid ${tableStyle.borderColor}`;
                cell.style.fontSize = `${fontSize}pt`;
                cell.style.textAlign = hasBulletList ? "left" : "center";
                cell.style.verticalAlign = "middle";

                if (isFirstColumnHeader && !hasBulletList) {
                    cell.style.whiteSpace = "nowrap";
                }

                if (currentRowHeightPx) {
                    cell.setAttribute("height", currentRowHeightPx);
                    cell.style.height = `${currentRowHeightPx}px`;
                }

                if (hasBulletList) {
                    styleSlideTableListCell(cell, fontSize);
                }

                wrapCellContent(cell, textColor, isHeaderCell, false, fontSize);
            });
        });
    });
}

function applyPlainCodeBlockTableStyles(container) {
    const tables = Array.from(container.querySelectorAll('table[data-code-block-table="true"]'));
    const tableStyle = getActiveTableStyle();
    const codeBlockTableBackgroundColor = "#f3f4f6";

    tables.forEach(table => {
        table.removeAttribute("style");
        table.setAttribute("border", "1");
        table.setAttribute("cellspacing", "0");
        table.setAttribute("cellpadding", "0");
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
            cell.style.padding = "2px 6px";
        });
    });
}

function applyPlainTableStyles(container) {
    const tables = container.matches?.("table") ? [container] : Array.from(container.querySelectorAll("table"));

    tables.forEach(table => {
        table.removeAttribute("style");
        table.setAttribute("border", "1");
        table.setAttribute("cellspacing", "0");
        table.setAttribute("cellpadding", "0");
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

        Array.from(table.querySelectorAll("td, th")).forEach(cell => {
            cell.style.padding = "2px 6px";
        });
    });
}

function getCellStyleTextAlign(cell) {
    const match = cell.getAttribute("style")?.match(/text-align\s*:\s*([^;]+)/i);
    return match ? match[1].trim() : "";
}
