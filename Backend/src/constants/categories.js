const CATEGORY_OPTIONS = [
    "Food",
    "Travel",
    "Bill Payments",
    "Money Transfer",
    "Shopping",
    "Groceries",
    "Rent",
    "Utilities",
    "Entertainment",
    "Health",
    "Education",
    "Other"
];

const NON_WORD_PREFIX_PATTERN = /^[^\p{L}\p{N}]+/u;

const CATEGORY_ALIAS_MAP = new Map([
    ["food", "Food"],
    ["travel", "Travel"],
    ["bill payments", "Bill Payments"],
    ["bill payment", "Bill Payments"],
    ["money transfer", "Money Transfer"],
    ["shopping", "Shopping"],
    ["groceries", "Groceries"],
    ["grocery", "Groceries"],
    ["rent", "Rent"],
    ["utilities", "Utilities"],
    ["utility", "Utilities"],
    ["entertainment", "Entertainment"],
    ["health", "Health"],
    ["education", "Education"],
    ["other", "Other"]
]);

const cleanCategoryValue = (value) =>
    String(value || "")
        .replace(/^#/, "")
        .replace(NON_WORD_PREFIX_PATTERN, "")
        .trim();

const normalizeCategoryName = (value) => {
    const cleaned = cleanCategoryValue(value);
    const normalizedKey = cleaned.toLowerCase();

    if (CATEGORY_ALIAS_MAP.has(normalizedKey)) {
        return CATEGORY_ALIAS_MAP.get(normalizedKey);
    }

    return cleaned || "Other";
};

export { CATEGORY_OPTIONS, normalizeCategoryName };
