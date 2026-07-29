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

    return markdown;
}

/**
 * Normalize **bold** so marked can render <strong>:
 * - Trim leading/trailing spaces/tabs inside **...** (e.g. ** text** → **text**)
 * - Insert a space after closing ** when the bold span ends with punctuation
 *   and the next character is a letter/number
 * Leaves fenced / inline code untouched.
 */
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
