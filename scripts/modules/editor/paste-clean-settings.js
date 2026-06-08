export const PASTE_CLEAN_OPTIONS_KEY = "paste_clean_options";

export const PASTE_CLEAN_OPTION_KEYS = [
    "font",
    "color",
    "bold",
    "italic",
    "links",
    "tableMetadata",
    "tableStyle"
];

export const DEFAULT_PASTE_CLEAN_OPTIONS = {
    font: false,
    color: false,
    bold: false,
    italic: false,
    links: false,
    tableMetadata: false,
    tableStyle: false
};

export function normalizePasteCleanOptions(savedOptions) {
    const normalized = { ...DEFAULT_PASTE_CLEAN_OPTIONS };

    if (!savedOptions || typeof savedOptions !== "object") {
        return normalized;
    }

    PASTE_CLEAN_OPTION_KEYS.forEach(key => {
        if (typeof savedOptions[key] === "boolean") {
            normalized[key] = savedOptions[key];
        }
    });

    return normalized;
}

export function getPasteCleanOptions() {
    try {
        const savedOptions = JSON.parse(localStorage.getItem(PASTE_CLEAN_OPTIONS_KEY));
        return normalizePasteCleanOptions(savedOptions);
    } catch {
        return { ...DEFAULT_PASTE_CLEAN_OPTIONS };
    }
}

export function savePasteCleanOptions(options) {
    localStorage.setItem(PASTE_CLEAN_OPTIONS_KEY, JSON.stringify(normalizePasteCleanOptions(options)));
}

export function readPasteCleanOptionsFromCheckboxes(checkboxes) {
    const options = { ...DEFAULT_PASTE_CLEAN_OPTIONS };

    PASTE_CLEAN_OPTION_KEYS.forEach(key => {
        options[key] = Boolean(checkboxes[key]?.checked);
    });

    return options;
}

export function loadPasteCleanOptions(checkboxes) {
    const options = getPasteCleanOptions();

    PASTE_CLEAN_OPTION_KEYS.forEach(key => {
        if (checkboxes[key]) {
            checkboxes[key].checked = options[key];
        }
    });
}

export function setAllPasteCleanCheckboxes(checkboxes, checked) {
    PASTE_CLEAN_OPTION_KEYS.forEach(key => {
        if (checkboxes[key]) {
            checkboxes[key].checked = checked;
        }
    });

    savePasteCleanOptions(readPasteCleanOptionsFromCheckboxes(checkboxes));
}
