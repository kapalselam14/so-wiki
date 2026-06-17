import "dotenv/config";

const API_URL = process.env.FANDOM_WIKI_API_URL

export async function fetchFandomPageHtml(page) {
    if (!API_URL) throw new Error(`FANDOM_WIKI_API_URL is not defined in .env`)
    const params = new URLSearchParams({
        action: 'parse',
        page,
        prop: 'text|links',
        format: 'json',
        origin: '*'
    })
    const url = `${API_URL}?${params.toString()}`

    const res = await fetch(url)
    const data = await res.json()

    if (!res.ok) throw new Error("Failed to fetch page: " + res.status)

    if (data?.error) {
        throw new Error(`Fandom API error for page ${page}: ${data.error.info || data.error.code}`)
    }

    const html = data?.parse?.text?.["*"]

    if (!html) throw new Error(`No HTML content found for page: ${page}`)

    return html;
}
