function filterMarkdown(markdown) {

    if (markdown.startsWith("```markdown") && markdown.endsWith("```")) {
        markdown = markdown.slice(11, -3).trim();
    }

    if (markdown.indexOf("```markdown") > -1) {
        const needleStart = markdown.indexOf("```markdown") + 11;
        const needleEnd = markdown.lastIndexOf("```");
        markdown = markdown.slice(needleStart, needleEnd);
    }

    // @TODO 如果有一行只有多個 = 符號，則把該行刪除
    markdown = markdown.replace(/^={2,}\r?\n?/gm, "");

    markdown = markdown.replace(/\s*\[\d+(?:,\s*\d+)*\](?=。)/g, "");

    markdown = markdown.replace(/^\s*\[!NOTE\]\s*(.*)$/gm, "\n<table><tr><td bgcolor=\"yellow\">[!NOTE] $1</td></tr></table>\n");

    markdown = markdown.replaceAll("</table>\n", "</table><br />\n");

    markdown = markdown.replaceAll("\n</pre>", "</pre>");

    // CommonMark bold quirks: trim spaces inside **...**, and insert a space
    // after closing ** when it ends with punctuation then a letter/number
    // (e.g. **（untagged）**範例, **標題：**內文).
    markdown = normalizeBoldDelimiters(markdown);
    markdown = collapseBrokenBoldMarkers(markdown);

    // CommonMark needs a child list indented at least as wide as the parent
    // marker (e.g. "- " = 2 columns). Sources often use 1 space, which would
    // otherwise flatten the nesting.
    markdown = normalizeListIndentation(markdown);

    // Blank lines between items make the list "loose", so marked wraps every
    // item in <p> and the preview gains extra vertical gaps.
    markdown = removeBlankLinesBetweenListItems(markdown);

    return markdown;
}

const LIST_ITEM_LINE_RE = /^([ \t]*)([-*+]|\d{1,9}[.)])([ \t]+)(?=\S)/;

function expandLeadingTabs(indent) {
    let width = 0;

    for (const char of indent) {
        width = char === "\t" ? width + 4 - (width % 4) : width + 1;
    }

    return width;
}

/**
 * Re-indent nested list items so each depth uses the CommonMark-required width.
 * Relative depth comes from the source indent widths, so a 1-space child list
 * (common in exported Markdown) still renders as a nested <ul>/<ol>.
 */
function normalizeListIndentation(markdown) {
    return mapOutsideFencedCode(markdown, normalizeListIndentationInText);
}

function normalizeListIndentationInText(text) {
    const lines = text.split("\n");
    // Each entry: { sourceWidth, outputIndent, contentIndent }
    let stack = [];
    let sawListItem = false;

    const nextLines = lines.map(line => {
        const match = line.match(LIST_ITEM_LINE_RE);

        if (!match) {
            // Blank lines keep list context (loose lists); other unindented
            // content ends the current list.
            if (line.trim() === "") {
                return line;
            }

            if (expandLeadingTabs(line.match(/^[ \t]*/)[0]) === 0) {
                stack = [];
            }

            return line;
        }

        const [, indent, marker, spacing] = match;
        const sourceWidth = expandLeadingTabs(indent);

        while (stack.length > 0 && sourceWidth < stack[stack.length - 1].sourceWidth) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];

        if (!parent) {
            stack = [];
        } else if (sourceWidth > parent.sourceWidth) {
            // Deeper than the parent marker: start a new nesting level.
        } else {
            // Same level as the parent: reuse its indent.
            stack.pop();
        }

        const enclosing = stack[stack.length - 1];
        const outputIndent = enclosing ? enclosing.contentIndent : 0;
        const contentIndent = outputIndent + marker.length + spacing.length;

        stack.push({ sourceWidth, outputIndent, contentIndent });
        sawListItem = true;

        return " ".repeat(outputIndent) + line.slice(indent.length);
    });

    return sawListItem ? nextLines.join("\n") : text;
}

/**
 * Drop blank lines that sit between list items so the list stays "tight".
 * A loose list makes marked wrap each item in <p>, which shows up as extra
 * spacing in the preview and in the copied rich text.
 * Blank lines before/after the whole list are kept, and fenced code is skipped.
 */
function removeBlankLinesBetweenListItems(markdown) {
    return mapOutsideFencedCode(markdown, removeBlankLinesBetweenListItemsInText);
}

function removeBlankLinesBetweenListItemsInText(text) {
    const lines = text.split("\n");
    const result = [];
    let pendingBlankLines = [];
    let inList = false;

    lines.forEach(line => {
        if (line.trim() === "") {
            if (inList) {
                pendingBlankLines.push(line);
            } else {
                result.push(line);
            }

            return;
        }

        const isListItem = LIST_ITEM_LINE_RE.test(line);
        const isIndented = expandLeadingTabs(line.match(/^[ \t]*/)[0]) > 0;

        if (inList && (isListItem || isIndented)) {
            // Still inside the list: the buffered blank lines were only
            // separating items (or an item and its continuation), so drop them.
            pendingBlankLines = [];
            result.push(line);
            return;
        }

        // The list ended: restore the blank lines that closed it.
        result.push(...pendingBlankLines);
        pendingBlankLines = [];
        result.push(line);
        inList = isListItem;
    });

    result.push(...pendingBlankLines);

    return result.join("\n");
}

/**
 * Normalize **bold** so marked can render <strong>:
 * - Trim leading/trailing spaces/tabs inside **...** (e.g. ** text** → **text**)
 * - Insert a space after closing ** when the bold span ends with punctuation
 *   and the next character is a letter/number
 * Leaves fenced / inline code untouched.
 */
function collapseBrokenBoldMarkers(markdown) {
    return mapOutsideFencedCode(markdown, (segment) =>
        mapOutsideInlineCode(segment, collapseBrokenBoldMarkersInText)
    );
}

function collapseBrokenBoldMarkersInText(text) {
    return text.split(/(\n)/).map(part => {
        if (part === "\n" || /^\s*\*{3,}\s*$/.test(part)) {
            return part;
        }

        return collapseBrokenBoldMarkersInLine(part);
    }).join("");
}

function collapseBrokenBoldMarkersInLine(line) {
    const indentMatch = line.match(/^[ \t]*/);
    const indent = indentMatch ? indentMatch[0] : "";
    let result = line.slice(indent.length);
    let previous;

    do {
        previous = result;
        result = result.replace(
            /\*\*((?:(?!\*\*)[\s\S])+?)\*\*\*\*((?:(?!\*\*)[\s\S])+?)\*\*/g,
            "**$1$2**"
        );
        result = result.replace(/(^|[^*])\*\*\*\*([^*]|$)/g, "$1$2");
    } while (result !== previous);

    return indent + result.replace(/[ \t]{2,}/g, " ");
}

function normalizeBoldDelimiters(markdown) {
    return mapOutsideFencedCode(markdown, (segment) =>
        mapOutsideInlineCode(segment, normalizeBoldDelimitersInText)
    );
}

function normalizeBoldDelimitersInText(text) {
    return text.replace(/\*\*((?:(?!\*\*)[\s\S])+?)\*\*/g, (match, inner, offset, full) => {
        const trimmedInner = inner.replace(/^[ \t]+|[ \t]+$/g, "");
        if (!trimmedInner) {
            return match;
        }

        let result = `**${trimmedInner}**`;
        const nextChar = full[offset + match.length];
        if (
            nextChar &&
            /[\p{L}\p{N}]/u.test(nextChar) &&
            /[\p{P}\p{S}]$/u.test(trimmedInner)
        ) {
            result += " ";
        }

        return result;
    });
}

function mapOutsideFencedCode(markdown, transform) {
    const fencePattern = /(^ {0,3}`{3,}[^\n]*\n[\s\S]*?^ {0,3}`{3,}[ \t]*$)/gm;
    let result = "";
    let lastIndex = 0;
    let match;

    while ((match = fencePattern.exec(markdown)) !== null) {
        result += transform(markdown.slice(lastIndex, match.index));
        result += match[0];
        lastIndex = match.index + match[0].length;
    }

    result += transform(markdown.slice(lastIndex));
    return result;
}

function mapOutsideInlineCode(text, transform) {
    let result = "";
    let index = 0;

    while (index < text.length) {
        if (text[index] === "`") {
            const ticks = text.slice(index).match(/^`+/)[0];
            const closeIndex = text.indexOf(ticks, index + ticks.length);
            if (closeIndex === -1) {
                result += transform(text.slice(index));
                break;
            }
            result += text.slice(index, closeIndex + ticks.length);
            index = closeIndex + ticks.length;
            continue;
        }

        const nextTick = text.indexOf("`", index);
        if (nextTick === -1) {
            result += transform(text.slice(index));
            break;
        }

        result += transform(text.slice(index, nextTick));
        index = nextTick;
    }

    return result;
}
