export function cleanText(text= ""){
    return text.replace(/\s+/g," ").trim()
}

export function createSlug(text = ""){
    return text
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function parseCommaList(text){
    if (!text) return []

    const normalized = cleanText(text)

    if(normalized.toLowerCase() === "none") return []

    const items = normalized
    .split(",")
    .map((item) => cleanText(item))
    .map((item) => item.replace(/\.$/, ""))
    .filter(Boolean)

    return [...new Set(items)]
}
