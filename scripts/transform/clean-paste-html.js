const FONT_STYLE_PROPERTIES = new Set([
    "font-family",
    "font-size",
    "font-face",
    "line-height",
    "letter-spacing",
    "word-spacing"
]);

const COLOR_STYLE_PROPERTIES = new Set([
    "color",
    "background-color",
    "background"
]);

const BOLD_STYLE_VALUES = new Set(["bold", "bolder", "600", "700", "800", "900"]);
const ITALIC_STYLE_VALUES = new Set(["italic", "oblique"]);

const WORD_FONT_JUNK_ATTRIBUTE_NAMES = new Set(["times", "new", "face", "size", "font"]);

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

function parseStyleDeclarations(styleText) {
    return styleText
        .split(";")
        .map(declaration => declaration.trim())
        .filter(Boolean)
        .map(declaration => {
            const separatorIndex = declaration.indexOf(":");
            if (separatorIndex === -1) {
                return null;
            }

            const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
            const value = declaration.slice(separatorIndex + 1).trim().toLowerCase();

            return property ? { property, value, raw: declaration } : null;
        })
        .filter(Boolean);
}

function rebuildStyle(declarations) {
    if (declarations.length === 0) {
        return "";
    }

    return declarations.map(declaration => declaration.raw).join("; ");
}

function removeStyleProperties(element, propertyFilter) {
    const styleText = element.getAttribute("style");
    if (!styleText) {
        return;
    }

    const keptDeclarations = parseStyleDeclarations(styleText).filter(
        declaration => !propertyFilter(declaration.property, declaration.value)
    );
    const rebuiltStyle = rebuildStyle(keptDeclarations);

    if (rebuiltStyle) {
        element.setAttribute("style", rebuiltStyle);
    } else {
        element.removeAttribute("style");
    }
}

function unwrapElementsBySelector(root, selector) {
    Array.from(root.querySelectorAll(selector)).forEach(unwrapElement);
}

function unwrapAllBySelector(root, selector) {
    let element = root.querySelector(selector);

    while (element) {
        unwrapElement(element);
        element = root.querySelector(selector);
    }
}

function unwrapDivsInTableCells(root) {
    let divInCell = root.querySelector("td div, th div");

    while (divInCell) {
        unwrapElement(divInCell);
        divInCell = root.querySelector("td div, th div");
    }
}

function unwrapLinks(root) {
    Array.from(root.querySelectorAll("a")).forEach(link => {
        const textNode = document.createTextNode(link.textContent);
        link.parentNode.replaceChild(textNode, link);
    });
}

function isWordFontJunkAttributeName(attributeName) {
    const normalized = attributeName.toLowerCase();

    if (WORD_FONT_JUNK_ATTRIBUTE_NAMES.has(normalized)) {
        return true;
    }

    return normalized.includes("roman")
        || normalized.includes("font-family")
        || normalized.includes("font-weight")
        || normalized.includes("font-style")
        || /";font-/.test(normalized)
        || /^[a-z\s"']+";/.test(normalized);
}

function unwrapMalformedWordFontSpansInHtml(html) {
    return html.replace(
        /<span\s+(?=[^>]*\btimes\s*=\s*(?:""|''))(?=[^>]*\bnew\s*=\s*(?:""|''))[^>]*>([\s\S]*?)<\/span>/gi,
        "$1"
    );
}

function removeWordFontJunkAttributes(element) {
    Array.from(element.attributes).forEach(attribute => {
        if (isWordFontJunkAttributeName(attribute.name)) {
            element.removeAttribute(attribute.name);
        }
    });
}

function cleanFontAttributes(root) {
    root.querySelectorAll("[style]").forEach(element => {
        removeStyleProperties(element, property => FONT_STYLE_PROPERTIES.has(property));
    });

    root.querySelectorAll("font, span, div").forEach(element => {
        element.removeAttribute("style");
        removeWordFontJunkAttributes(element);

        if (element.tagName === "FONT") {
            element.removeAttribute("face");
            element.removeAttribute("size");
        }
    });

    unwrapAllBySelector(root, "font");
    unwrapAllBySelector(root, "span");
    unwrapDivsInTableCells(root);
}

function cleanColorAttributes(root) {
    root.querySelectorAll("font").forEach(fontElement => {
        fontElement.removeAttribute("color");

        if (!fontElement.attributes.length) {
            unwrapElement(fontElement);
        }
    });

    root.querySelectorAll("[bgcolor]").forEach(element => {
        element.removeAttribute("bgcolor");
    });

    root.querySelectorAll("[style]").forEach(element => {
        removeStyleProperties(element, property => COLOR_STYLE_PROPERTIES.has(property));
    });
}

function cleanBoldFormatting(root) {
    unwrapElementsBySelector(root, "b, strong");

    root.querySelectorAll("[style]").forEach(element => {
        removeStyleProperties(
            element,
            (property, value) => property === "font-weight" && BOLD_STYLE_VALUES.has(value)
        );
    });
}

function cleanItalicFormatting(root) {
    unwrapElementsBySelector(root, "i, em");

    root.querySelectorAll("[style]").forEach(element => {
        removeStyleProperties(
            element,
            (property, value) => property === "font-style" && ITALIC_STYLE_VALUES.has(value)
        );
    });
}

const TABLE_ELEMENTS_SELECTOR = "table, thead, tbody, tfoot, tr, th, td, col, colgroup";

const TABLE_STYLE_ATTRIBUTES = [
    "style",
    "bgcolor",
    "border",
    "cellpadding",
    "cellspacing",
    "bordercolor",
    "align",
    "valign",
    "width",
    "height",
    "class"
];

function isTableMetadataAttribute(attributeName) {
    return attributeName === "xmlns"
        || attributeName === "dir"
        || attributeName.startsWith("data-");
}

function cleanTableMetadata(root) {
    root.querySelectorAll(TABLE_ELEMENTS_SELECTOR).forEach(element => {
        Array.from(element.attributes).forEach(attribute => {
            if (isTableMetadataAttribute(attribute.name)) {
                element.removeAttribute(attribute.name);
            }
        });
    });
}

function cleanTableStyles(root) {
    root.querySelectorAll(TABLE_ELEMENTS_SELECTOR).forEach(element => {
        TABLE_STYLE_ATTRIBUTES.forEach(attribute => element.removeAttribute(attribute));
    });
}

function unwrapEmptyInlineElements(root) {
    let changed = true;

    while (changed) {
        changed = false;

        root.querySelectorAll("span, font").forEach(element => {
            if (element.attributes.length === 0) {
                unwrapElement(element);
                changed = true;
            }
        });
    }
}

function cleanPasteHtml(html, options = {}) {
    if (!html || !html.trim()) {
        return html;
    }

    const hasActiveOption = Object.values(options).some(Boolean);
    if (!hasActiveOption) {
        return html;
    }

    let processedHtml = html.trim();

    if (options.font) {
        processedHtml = unwrapMalformedWordFontSpansInHtml(processedHtml);
    }

    const container = document.createElement("div");
    container.innerHTML = processedHtml;

    if (options.tableMetadata) {
        cleanTableMetadata(container);
    }

    if (options.tableStyle) {
        cleanTableStyles(container);
    }

    if (options.links) {
        unwrapLinks(container);
    }

    if (options.bold) {
        cleanBoldFormatting(container);
    }

    if (options.italic) {
        cleanItalicFormatting(container);
    }

    if (options.color) {
        cleanColorAttributes(container);
    }

    if (options.font) {
        cleanFontAttributes(container);
    }

    unwrapEmptyInlineElements(container);

    return container.innerHTML;
}

window.cleanPasteHtml = cleanPasteHtml;
