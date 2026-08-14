const GMAIL_LOGO_SRC_RE = /logo_gmail|ssl\.gstatic\.com\/ui\/v1\/icons\/mail/i;
const GMAIL_SIGNATURE_SELECTOR = [
    ".gmail_signature",
    "[data-smartmail='gmail_signature']",
    "[data-smartmail=\"gmail_signature\"]"
].join(", ");
const GMAIL_QUOTE_SELECTOR = ".gmail_quote, .gmail_extra, blockquote.gmail_quote";
const MESSAGE_COUNT_RE = /^\d+\s*(封郵件|則郵件|messages?)$/i;
const MESSAGE_COUNT_INLINE_RE = /\d+\s*(封郵件|則郵件|messages?)/i;
const RECIPIENT_LINE_RE = /^(收件者|收件人|副本|密件副本|回覆|To|Cc|Bcc|Reply-To)\s*:/i;
const SUBJECT_NOISE_RE = /(?:收件者|收件人|副本|密件副本|回覆|To:|Cc:|Bcc:)/;
const WRAPPER_TAGS = new Set(["DIV", "CENTER", "SPAN", "FONT", "SECTION", "MAIN", "ARTICLE"]);
const MAX_SUBJECT_LENGTH = 200;
const HIDDEN_QUOTE_RE = /^\[?(隱藏引用文字|Hide quoted text|Show quoted text|Show trimmed content)\]?$/i;
const GMAIL_PRINT_MARKER_RE = /logo_gmail|ssl\.gstatic\.com\/ui\/v1\/icons\/mail|gmail_signature|data-smartmail=["']gmail_signature["']|class=["'][^"']*\b(?:message|recipient|replyto)\b/i;

function unwrapElement(element) {
    const parent = element.parentNode;
    if (!parent) {
        return;
    }

    while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }

    parent.removeChild(element);
}

function normalizeSpace(text) {
    return String(text || "")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\s*\n\s*/g, "\n")
        .trim();
}

function finalizeMarkdown(markdown) {
    const collapsed = typeof collapseBrokenBoldMarkers === "function"
        ? collapseBrokenBoldMarkers(markdown)
        : String(markdown || "");

    return collapsed
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function isGmailPrintContent(content) {
    const text = String(content || "");
    if (!text.trim()) {
        return false;
    }

    if (GMAIL_PRINT_MARKER_RE.test(text)) {
        return true;
    }

    return /<table[\s\S]{0,4000}(?:收件者|收件人|To:)[\s\S]{0,1500}(?:副本|Cc:)/i.test(text);
}

function removeGmailSignatures(root) {
    root.querySelectorAll(GMAIL_SIGNATURE_SELECTOR).forEach(element => element.remove());
}

function removeHiddenQuotedText(root) {
    root.querySelectorAll(GMAIL_QUOTE_SELECTOR).forEach(element => element.remove());

    Array.from(root.querySelectorAll("font, span, div, p")).forEach(element => {
        const text = normalizeSpace(element.textContent);
        if (HIDDEN_QUOTE_RE.test(text) && !element.querySelector("table, ul, ol, img")) {
            element.remove();
        }
    });
}

function removePresentationalBreaks(root) {
    root.querySelectorAll("wbr").forEach(element => element.remove());
    root.querySelectorAll("br[clear]").forEach(element => element.remove());
}

function isMeaningfulNode(node) {
    if (!node) {
        return false;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        return true;
    }

    return node.nodeType === Node.TEXT_NODE
        && Boolean(node.textContent.replace(/\u00a0/g, " ").trim());
}

function unwrapSingleChildWrappers(root) {
    let changed = true;

    while (changed) {
        changed = false;
        const meaningfulChildren = Array.from(root.childNodes).filter(isMeaningfulNode);
        const onlyChild = meaningfulChildren[0];

        if (meaningfulChildren.length !== 1 || onlyChild.nodeType !== Node.ELEMENT_NODE) {
            break;
        }

        if (!WRAPPER_TAGS.has(onlyChild.tagName)) {
            break;
        }

        unwrapElement(onlyChild);
        changed = true;
    }
}

function flattenGmailPrintWrappers(root) {
    let changed = true;

    while (changed) {
        const before = root.innerHTML;
        unwrapSingleChildWrappers(root);
        unwrapLayoutTables(root);
        unwrapSingleChildWrappers(root);
        changed = root.innerHTML !== before;
    }
}

function unwrapStructuralItalics(root) {
    Array.from(root.querySelectorAll("i, em")).forEach(element => {
        if (element.querySelector("table, p, ul, ol, div, h1, h2, h3, h4, h5, h6")) {
            unwrapElement(element);
        }
    });
}

function isGmailLogoImage(image) {
    if (!image) {
        return false;
    }

    const src = image.getAttribute("src") || "";
    const alt = image.getAttribute("alt") || "";
    return GMAIL_LOGO_SRC_RE.test(src) || /gmail/i.test(alt);
}

function isGmailHeaderTable(table) {
    if (isGmailLogoImage(table.querySelector("img"))) {
        return true;
    }

    const text = normalizeSpace(table.textContent);
    const hasAccount = /<.+@.+>/.test(text) || /@gmail\.com/i.test(text);
    return table.rows.length === 1 && table.rows[0].cells.length === 2 && hasAccount && table.querySelector("img");
}

function removeGmailPageChrome(root) {
    Array.from(root.querySelectorAll("table")).forEach(table => {
        if (isGmailHeaderTable(table)) {
            table.remove();
        }
    });

    root.querySelectorAll("img").forEach(image => {
        if (isGmailLogoImage(image)) {
            image.remove();
        }
    });
}

function isLayoutTable(table) {
    if (table.classList.contains("message") || table.querySelector(".recipient, .replyto, .gmail_signature")) {
        return false;
    }

    const rows = Array.from(table.rows);
    if (rows.length !== 1 || rows[0].cells.length !== 1) {
        return false;
    }

    const border = table.getAttribute("border");
    return border === "0" || border === null || border === "";
}

function unwrapLayoutTables(root) {
    let changed = true;

    while (changed) {
        changed = false;

        Array.from(root.querySelectorAll("table")).forEach(table => {
            if (!isLayoutTable(table)) {
                return;
            }

            const cell = table.rows[0]?.cells[0];
            const parent = table.parentNode;
            if (!cell || !parent) {
                return;
            }

            while (cell.firstChild) {
                parent.insertBefore(cell.firstChild, table);
            }

            table.remove();
            changed = true;
        });
    }
}

function isRecipientText(text) {
    return String(text || "")
        .split(/\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .some(line => RECIPIENT_LINE_RE.test(line));
}

function isGmailMessageTable(table) {
    if (table.classList.contains("message")) {
        return true;
    }

    if (table.querySelector(".recipient, .replyto, .gmail_signature")) {
        return true;
    }

    const headerRow = table.tHead?.rows[0] || table.rows[0];
    const hasTwoHeaderCells = Boolean(headerRow && headerRow.cells.length === 2);
    return hasTwoHeaderCells && isRecipientText(table.textContent);
}

function isInsideAnotherMessageTable(table) {
    let parent = table.parentElement;

    while (parent) {
        if (parent.tagName === "TABLE" && parent !== table && isGmailMessageTable(parent)) {
            return true;
        }

        parent = parent.parentElement;
    }

    return false;
}

function findGmailMessageTables(root) {
    return Array.from(root.querySelectorAll("table")).filter(table => {
        return isGmailMessageTable(table) && !isInsideAnotherMessageTable(table);
    });
}

function extractRecipientLines(cell) {
    const blocks = Array.from(cell.querySelectorAll("div, p"));
    const lines = (blocks.length ? blocks : [cell])
        .map(element => normalizeSpace(element.textContent))
        .filter(Boolean);

    return [...new Set(lines)].filter(line => RECIPIENT_LINE_RE.test(line));
}

function extractMessageHeader(table) {
    const headerRow = table.tHead?.rows[0] || table.rows[0];
    if (!headerRow || headerRow.cells.length === 0) {
        return { sender: "", date: "" };
    }

    return {
        sender: normalizeSpace(headerRow.cells[0].textContent),
        date: headerRow.cells[1] ? normalizeSpace(headerRow.cells[1].textContent) : ""
    };
}

function extractMessageParts(table) {
    const { sender, date } = extractMessageHeader(table);
    const contentRows = table.tHead ? Array.from(table.tBodies).flatMap(body => Array.from(body.rows)) : Array.from(table.rows).slice(1);

    let recipientLines = [];
    let bodyCell = null;

    contentRows.forEach(row => {
        const cell = row.cells[0];
        if (!cell) {
            return;
        }

        if (cell.querySelector(".recipient, .replyto") || isRecipientText(cell.textContent)) {
            recipientLines = extractRecipientLines(cell);
            return;
        }

        bodyCell = cell;
    });

    if (!bodyCell) {
        bodyCell = contentRows[contentRows.length - 1]?.cells[0] || null;
    }

    return { sender, date, recipientLines, bodyCell };
}

function cleanSubjectLine(text) {
    return normalizeSpace(text)
        .replace(/^#+\s*/, "")
        .replace(/^`+|`+$/g, "")
        .replace(/^\*+|\*+$/g, "")
        .trim();
}

function isPlausibleSubject(text) {
    const subject = String(text || "").trim();
    if (!subject || subject.length > MAX_SUBJECT_LENGTH) {
        return false;
    }

    if (MESSAGE_COUNT_RE.test(subject) || SUBJECT_NOISE_RE.test(subject)) {
        return false;
    }

    return true;
}

function splitFlattenedGmailLeadIn(text) {
    return String(text || "")
        .replace(MESSAGE_COUNT_INLINE_RE, "\n$&\n")
        .replace(/(收件者|收件人|副本|密件副本|回覆|To:|Cc:|Bcc:)/g, "\n$1")
        .replace(/(20\d{2}年\d{1,2}月\d{1,2}日)/g, "\n$1\n");
}

function extractSubjectFromText(text) {
    const lines = splitFlattenedGmailLeadIn(text)
        .split(/\n/)
        .map(line => line.trim())
        .filter(Boolean);

    for (const line of lines) {
        if (/^[-*_|]{2,}$/.test(line) || /^[*_]{3,}$/.test(line) || /^\* \* \*$/.test(line)) {
            continue;
        }

        if (/^```/.test(line) || /^\|/.test(line) || /logo_gmail/i.test(line) || /^!?\[Gmail\]/i.test(line)) {
            continue;
        }

        if (MESSAGE_COUNT_RE.test(line) || /@gmail\.com/i.test(line) && /[<>]/.test(line)) {
            continue;
        }

        const cleaned = cleanSubjectLine(line);
        if (isPlausibleSubject(cleaned)) {
            return cleaned;
        }
    }

    return "";
}

function collectLeadingTextBefore(root, stopNode) {
    if (!stopNode) {
        return "";
    }

    const parts = [];

    for (const node of Array.from(root.childNodes)) {
        if (node === stopNode || (node.nodeType === Node.ELEMENT_NODE && node.contains(stopNode))) {
            break;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            parts.push(node.textContent || "");
            continue;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            continue;
        }

        if (node.tagName === "BR" || node.tagName === "HR") {
            parts.push("\n");
            continue;
        }

        parts.push(node.innerText || node.textContent || "", "\n");
    }

    return parts.join("");
}

function extractGmailSubject(root) {
    const heading = Array.from(root.querySelectorAll("h1, h2, h3")).find(candidate => {
        return !candidate.querySelector("table") && isPlausibleSubject(cleanSubjectLine(candidate.textContent));
    });

    if (heading) {
        const text = cleanSubjectLine(heading.textContent);
        heading.remove();
        return text;
    }

    const firstMessageTable = findGmailMessageTables(root)[0];
    const stopNode = firstMessageTable || root.querySelector("table");
    return extractSubjectFromText(collectLeadingTextBefore(root, stopNode));
}

function convertGmailBodyToMarkdown(bodyCell) {
    if (!bodyCell) {
        return "";
    }

    const container = document.createElement("div");
    container.innerHTML = bodyCell.innerHTML;

    unwrapLayoutTables(container);
    unwrapStructuralItalics(container);
    removeGmailSignatures(container);
    removeHiddenQuotedText(container);
    removePresentationalBreaks(container);

    if (typeof window.convertHtmlToMarkdown !== "function") {
        return normalizeSpace(container.textContent);
    }

    return window.convertHtmlToMarkdown(container.innerHTML, {
        skipTableStyles: true,
        preserveTextColor: true
    }).trim();
}

function renderGmailMessageMarkdown(message) {
    const parts = [];

    if (message.sender) {
        parts.push(`## ${message.sender}`, "");
    }

    if (message.date) {
        parts.push(`**${message.date}**`, "");
    }

    if (message.recipientLines.length > 0) {
        parts.push(...message.recipientLines, "");
    }

    if (message.body) {
        parts.push(message.body);
    }

    return parts.join("\n").trim();
}

function escapeBareEmailTags(content) {
    return String(content || "").replace(/<([^\s<>]+@[^\s<>]+)>/g, "&lt;$1&gt;");
}

function convertGmailPrintToMarkdown(content) {
    const raw = String(content || "").trim();
    if (!raw) {
        return "";
    }

    const container = document.createElement("div");
    container.innerHTML = escapeBareEmailTags(raw);

    flattenGmailPrintWrappers(container);
    removeGmailPageChrome(container);
    removeGmailSignatures(container);
    removeHiddenQuotedText(container);
    removePresentationalBreaks(container);
    unwrapStructuralItalics(container);
    flattenGmailPrintWrappers(container);

    const subject = extractGmailSubject(container);
    const messageTables = findGmailMessageTables(container);

    if (messageTables.length === 0) {
        unwrapLayoutTables(container);
        const fallback = typeof window.convertHtmlToMarkdown === "function"
            ? window.convertHtmlToMarkdown(container.innerHTML, {
                skipTableStyles: true,
                preserveTextColor: true
            })
            : normalizeSpace(container.textContent);

        return finalizeMarkdown(subject ? `# ${subject}\n\n${fallback}` : fallback);
    }

    const messages = messageTables.map(table => {
        const parts = extractMessageParts(table);
        return {
            sender: parts.sender,
            date: parts.date,
            recipientLines: parts.recipientLines,
            body: convertGmailBodyToMarkdown(parts.bodyCell)
        };
    });

    const output = [];
    if (subject) {
        output.push(`# ${subject}`, "");
    }

    messages.forEach((message, index) => {
        if (index > 0) {
            output.push("", "---", "");
        }

        output.push(renderGmailMessageMarkdown(message));
    });

    return finalizeMarkdown(output.join("\n"));
}

function tryConvertGmailPrintToMarkdown(content) {
    if (!isGmailPrintContent(content)) {
        return { converted: false, markdown: String(content || "") };
    }

    const markdown = convertGmailPrintToMarkdown(content);
    if (!markdown || markdown === String(content || "").trim()) {
        return { converted: false, markdown: String(content || "") };
    }

    return { converted: true, markdown };
}

window.isGmailPrintContent = isGmailPrintContent;
window.convertGmailPrintToMarkdown = convertGmailPrintToMarkdown;
window.tryConvertGmailPrintToMarkdown = tryConvertGmailPrintToMarkdown;
