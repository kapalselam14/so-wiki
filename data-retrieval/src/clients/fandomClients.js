import "dotenv/config";

const API_URL = process.env.FANDOM_WIKI_API_URL

export async function fetchFandomPageHtml(page) {
    const params = new URLSearchParams({
        action: 'parse',
        page,
        prop: 'text|links',
        format: 'json',
        origin: '*'
    })
    const url = `${API_URL}?${params.toString()}`

    const res = await fetch(url)

    if (!res.ok) throw new Error("Failed to fetch page: " + res.status)

    const html = res.data?.parse?.text?.["*"]

    if (!html) throw new Error(`No HTML content found for page: ${page}`)

    return html;
}